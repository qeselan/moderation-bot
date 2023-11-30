#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfraStack } from "../lib/discord-server/discord-server-stack";

const app = new cdk.App();
new InfraStack(app, "DiscordBotStack", {
  env: { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT },
});
