import * as ecs from "aws-cdk-lib/aws-ecs";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
import { InstanceType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  Protocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { resolve } from "path";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { LoadBalancerTarget } from "aws-cdk-lib/aws-route53-targets";
import * as sm from "aws-cdk-lib/aws-secretsmanager";

import { ACM } from "../ACM";
import { Route53 } from "../Route53";

import {
  backend_subdomain,
  domain_name,
  discord_secret_arn,
} from "../../../config.json";

interface Props {
  vpc: Vpc;
  acm: ACM;
  route53: Route53;
  noteServiceLoadBalancer: ApplicationLoadBalancer;
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

    this.log_group = new LogGroup(scope, "ECSLogGroup", {
      logGroupName: "ecs-logs-moderation-bot",
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.cluster = new ecs.Cluster(scope, "EcsCluster", { vpc: props.vpc });

    this.cluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: new InstanceType("t2.micro"),
      maxCapacity: 1,
    });

    this.task_definition = new ecs.Ec2TaskDefinition(scope, "TaskDefinition");

    const secret = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
      secretCompleteArn: discord_secret_arn,
    });

    this.container = this.task_definition.addContainer("Express", {
      image: ecs.ContainerImage.fromAsset(
        resolve(__dirname, "..", "..", "..", "..", "server")
      ),
      memoryLimitMiB: 256,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "moderation-bot",
        logGroup: this.log_group,
      }),
      secrets: {
        PUBLIC_KEY: ecs.Secret.fromSecretsManager(secret, "PUBLIC_KEY"),
      },
      environment: {
        NOTE_SERVICE: props.noteServiceLoadBalancer.loadBalancerDnsName,
      },
    });

    this.container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    this.service = new ecs.Ec2Service(scope, "Service", {
      cluster: this.cluster,
      taskDefinition: this.task_definition,
    });

    this.load_balancer = new ApplicationLoadBalancer(scope, "LB", {
      vpc: props.vpc,
      internetFacing: true,
      loadBalancerName: "moderation-bot-lb",
    });

    this.listener = this.load_balancer.addListener("PublicListener", {
      port: 443,
      open: true,
      certificates: [props.acm.certificate],
    });

    this.listener.addTargets("ECS", {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.service.loadBalancerTarget({
          containerName: "Express",
          containerPort: 3000,
        }),
      ],
      healthCheck: {
        protocol: Protocol.HTTP,
        path: "/health",
        timeout: Duration.seconds(10),
        unhealthyThresholdCount: 5,
        healthyThresholdCount: 5,
        interval: Duration.seconds(60),
      },
    });

    new ARecord(this, "BackendAliasRecord", {
      zone: props.route53.hosted_zone,
      target: RecordTarget.fromAlias(
        new LoadBalancerTarget(this.load_balancer)
      ),
      recordName: `${backend_subdomain}.${domain_name}`,
    });

    new CfnOutput(scope, "BackendURL", {
      value: this.load_balancer.loadBalancerDnsName,
    });
  }
}
