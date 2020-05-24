#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
let stack = new InfrastructureStack(
  app,
  'TheCardRoomInfrastructure',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  },
);
stack.buildStack()
  .then(r => "Stack built");
