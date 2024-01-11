import * as ecs from 'aws-cdk-lib/aws-ecs';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  Protocol,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { resolve } from 'path';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';

import {
  backend_subdomain,
  domain_name,
  discord_secret_arn,
} from '../../../config.json';

interface Props {
  vpc: Vpc;
}

export class ECS extends Construct {
  public readonly cluster: ecs.Cluster;

  public readonly task_definition: ecs.Ec2TaskDefinition;

  public readonly container: ecs.ContainerDefinition;

  public readonly service: ecs.Ec2Service;

  public readonly load_balancer: ApplicationLoadBalancer;

  public readonly listener: ApplicationListener;

  public readonly log_group: LogGroup;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    this.log_group = new LogGroup(scope, 'ECSLogGroup', {
      logGroupName: 'ecs-logs-moderation-bot/note-service',
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.cluster = new ecs.Cluster(scope, 'EcsCluster', { vpc: props.vpc });

    this.cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t2.micro'),
      maxCapacity: 1,
    });

    this.task_definition = new ecs.Ec2TaskDefinition(scope, 'TaskDefinition');

    const secret = sm.Secret.fromSecretAttributes(this, 'ImportedSecret', {
      secretCompleteArn: discord_secret_arn,
    });

    this.container = this.task_definition.addContainer('Express', {
      image: ecs.ContainerImage.fromAsset(
        resolve(__dirname, '..', '..', '..', '..', 'note-service')
      ),
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: 'moderation-bot/note-service',
        logGroup: this.log_group,
      }),
      secrets: {
        PUBLIC_KEY: ecs.Secret.fromSecretsManager(secret, 'PUBLIC_KEY'),
      },
    });

    this.container.addPortMappings({
      containerPort: 4000,
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.Ec2Service(scope, 'Service', {
      cluster: this.cluster,
      taskDefinition: this.task_definition,
    });

    this.load_balancer = new ApplicationLoadBalancer(scope, 'LB', {
      vpc: props.vpc,
      internetFacing: false,
      loadBalancerName: 'note-service-lb',
    });

    this.listener = this.load_balancer.addListener('PrivateListener', {
      port: 80,
      open: true,
    });

    this.listener.addTargets('ECS', {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.service.loadBalancerTarget({
          containerName: 'Express',
          containerPort: 4000,
        }),
      ],
      healthCheck: {
        protocol: Protocol.HTTP,
        path: '/health',
        timeout: Duration.seconds(10),
        unhealthyThresholdCount: 5,
        healthyThresholdCount: 5,
        interval: Duration.seconds(60),
      },
    });
  }
}
