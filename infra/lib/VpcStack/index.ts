import { Stack, StackProps } from "aws-cdk-lib";
import { SubnetType, IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "MyVPC", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "compute",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: "rds",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
