#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

const jacobleverComCertArn =
  "arn:aws:acm:eu-west-1:350413574090:certificate/8da48eb3-bba5-4337-a45f-335871db9572";
const stackEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new InfrastructureStack(
  app,
  'TheCardRoomInfrastructure',
  { env: stackEnv },
  {
    frontendCustomDomain: "cards.jacoblever.com",
    customDomainCertificateArn: jacobleverComCertArn,
    frontendEnvironment: "production",
  },
);

new InfrastructureStack(
  app,
  'TheCardRoomInfrastructureStaging',
  { env: stackEnv },
  {
    frontendCustomDomain: "cards-staging.jacoblever.com",
    customDomainCertificateArn: jacobleverComCertArn,
    frontendEnvironment: "staging",
  },
);
