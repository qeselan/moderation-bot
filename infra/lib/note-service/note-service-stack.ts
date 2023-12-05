import { Stack, StackProps } from "aws-cdk-lib";
import { IVpc, Port, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { ECS } from "./ECS";
import { RDS } from "./RDS";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

interface ApiStackProps extends StackProps {
  vpc: Vpc;
}

export class NoteServiceStack extends Stack {
  public readonly ecs: ECS;

  public readonly rds: RDS;

  public readonly loadBalancer: ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.ecs = new ECS(this, "ECS", {
      vpc: props.vpc,
    });

    this.rds = new RDS(this, "RDS", {
      vpc: props.vpc,
    });

    this.ecs.task_definition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [this.rds.credentials.secretArn],
      })
    );

    this.rds.instance.connections.allowFrom(this.ecs.cluster, Port.tcp(5432));

    this.loadBalancer = this.ecs.load_balancer;
  }
}
