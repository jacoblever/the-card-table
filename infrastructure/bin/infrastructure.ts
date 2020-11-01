#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

const HOUR = 60 * 60;

const jacobleverComCloudFrontCertArn =
  "arn:aws:acm:us-east-1:350413574090:certificate/0323ffad-0ce6-47b5-8d5e-f6e56f16e425";
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
    customDomainCertificateArn: jacobleverComCloudFrontCertArn,
    frontendEnvironment: "production",
    roomTimeToLive: 24 * HOUR,
  },
);

new InfrastructureStack(
  app,
  'TheCardRoomInfrastructureStaging',
  { env: stackEnv },
  {
    frontendCustomDomain: "cards-staging.jacoblever.com",
    customDomainCertificateArn: jacobleverComCloudFrontCertArn,
    frontendEnvironment: "staging",
    roomTimeToLive: HOUR / 2,
  },
);
