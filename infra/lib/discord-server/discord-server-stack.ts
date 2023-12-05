import { Stack, StackProps } from "aws-cdk-lib";
import { SubnetType, IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { ECS } from "./ECS";
import { Route53 } from "./Route53";
import { ACM } from "./ACM";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

interface DiscordBotStackProps extends StackProps {
  vpc: Vpc;
  noteServiceLoadBalancer: ApplicationLoadBalancer;
}

export class DiscordBotStack extends Stack {
  public readonly acm: ACM;

  public readonly ecs: ECS;

  public readonly route53: Route53;

  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: DiscordBotStackProps) {
    super(scope, id, props);

    this.route53 = new Route53(this, "Route53");

    this.acm = new ACM(this, "ACM", {
      hosted_zone: this.route53.hosted_zone,
    });

    this.ecs = new ECS(this, "ECS", {
      vpc: props.vpc,
      acm: this.acm,
      route53: this.route53,
      noteServiceLoadBalancer: props.noteServiceLoadBalancer,
    });
  }
}
