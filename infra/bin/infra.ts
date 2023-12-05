#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DiscordBotStack } from "../lib/discord-server/discord-server-stack";
import { NoteServiceStack } from "../lib/note-service/note-service-stack";
import { Vpc, SubnetType } from "aws-cdk-lib/aws-ec2";
import { VpcStack } from "../lib/VpcStack";

const app = new cdk.App();

const vpc = new VpcStack(app, "VpcStack", {
  env: { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT },
}).vpc;

const noteService = new NoteServiceStack(app, "NoteServiceStack", {
  env: { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT },
  vpc,
});

const discordServer = new DiscordBotStack(app, "DiscordBotStack", {
  env: { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT },
  vpc,
  noteServiceLoadBalancer: noteService.loadBalancer,
});
