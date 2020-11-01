import * as cdk from '@aws-cdk/core';
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage } from '@aws-cdk/aws-apigatewayv2'
import { CfnPermission, Code, Function as LambdaFunction, Runtime, StartingPosition } from '@aws-cdk/aws-lambda'
import { Bucket, BucketAccessControl, HttpMethods } from '@aws-cdk/aws-s3'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment'
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { AttributeType, ProjectionType, StreamViewType, Table, TableEncryption } from '@aws-cdk/aws-dynamodb'
import { exec } from 'child_process'
import { promisify } from 'util';
import { Certificate } from '@aws-cdk/aws-certificatemanager'
import { CloudFrontWebDistribution, ViewerCertificate } from "@aws-cdk/aws-cloudfront";
import { DynamoEventSource } from "@aws-cdk/aws-lambda-event-sources";

const execAsync = promisify(exec);

type CardRoomParams = {
  frontendCustomDomain: string,
  customDomainCertificateArn: string,
  frontendEnvironment: "production" | "staging",
  roomTimeToLive: number,
}

export class InfrastructureStack extends cdk.Stack {
  private readonly awsRegion: string;
  private readonly awsAccountId: string;
  private readonly frontendCustomDomain: string;
  private readonly customDomainCertificateArn: string;
  private readonly frontendEnvironment: string;

  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps, params: CardRoomParams) {
    super(scope, id, props);

    this.awsRegion = props?.env?.region!;
    this.awsAccountId = props?.env?.account!;

    this.frontendCustomDomain = params.frontendCustomDomain;
    this.customDomainCertificateArn = params.customDomainCertificateArn;
    this.frontendEnvironment = params.frontendEnvironment;

    let api = new CfnApi(
      this,
      "api",
      {
        name: "TheCardRoomWebSocketApi",
        protocolType: "WEBSOCKET",
        routeSelectionExpression: "$request.body.message",
      },
    );

    let playersTable = new Table(
      this,
      'PlayersTable',
      {
        partitionKey: {
          name: 'roomId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'playerId',
          type: AttributeType.STRING,
        },
        timeToLiveAttribute: 'timeToLive',
        readCapacity: 5,
        writeCapacity: 5,
        encryption: TableEncryption.AWS_MANAGED,
        stream: StreamViewType.KEYS_ONLY,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    let connectionsTable = new Table(
      this,
      'ConnectionsTable',
      {
        partitionKey: {
          name: 'roomId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'connectionId',
          type: AttributeType.STRING,
        },
        readCapacity: 5,
        writeCapacity: 5,
        encryption: TableEncryption.AWS_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );
    connectionsTable.addGlobalSecondaryIndex({
      indexName: 'findByConnectionId',
      partitionKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
      readCapacity: 5,
      writeCapacity: 5,
      projectionType: ProjectionType.ALL,
    })

    let cardsTable = new Table(
      this,
      'CardsTable',
      {
        partitionKey: {
          name: 'roomId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'cardId',
          type: AttributeType.STRING,
        },
        readCapacity: 5,
        writeCapacity: 5,
        encryption: TableEncryption.AWS_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    let connectFunction = this.createFunction("OnConnectFunction", "../backend/onconnect/", api);
    let disconnectFunction = this.createFunction("DisconnectFunction", "../backend/ondisconnect/", api);
    let sendFunction = this.createFunction("SendFunction", "../backend/sendmessage/", api);

    let onPlayerTtlFunction = this.createOnPlayerTtlFunction("../backend/onplayerttl/", playersTable);

    [connectFunction, disconnectFunction, sendFunction, onPlayerTtlFunction].forEach(f => {
      playersTable.grantReadWriteData(f);
      connectionsTable.grantReadWriteData(f);
      cardsTable.grantReadWriteData(f);
      f.addEnvironment("TABLE_NAME_PLAYERS", playersTable.tableName);
      f.addEnvironment("TABLE_NAME_CONNECTIONS", connectionsTable.tableName);
      f.addEnvironment("TABLE_NAME_CARDS", cardsTable.tableName);
      f.addEnvironment("ROOM_TIME_TO_LIVE", `${params.roomTimeToLive}`);
      f.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["execute-api:ManageConnections"],
        resources: [`arn:aws:execute-api:${this.awsRegion}:${this.awsAccountId}:${api.ref}/*`],
      }));
    });

    let connectIntegration = this.createIntegration("ConnectIntegration", api, "Connect Integration", this.awsRegion, connectFunction);
    let disconnectIntegration = this.createIntegration("DisconnectIntegration", api, "Disconnect Integration", this.awsRegion, disconnectFunction);
    let sendIntegration = this.createIntegration("SendIntegration", api, "Send Integration", this.awsRegion, sendFunction);

    let connectRoute = this.createRoute("ConnectRoute", api, "$connect", "ConnectRoute", connectIntegration);
    let disconnectRoute = this.createRoute("DisconnectRoute", api, "$disconnect", "DisconnectRoute", disconnectIntegration);
    let sendRoute = this.createRoute("SendRoute", api, "sendmessage", "SendRoute", sendIntegration);

    let deployment = new CfnDeployment(
      this,
      "deployment",
      {
        apiId: api.ref,
      },
    );
    deployment.addDependsOn(connectRoute);
    deployment.addDependsOn(sendRoute);
    deployment.addDependsOn(disconnectRoute);

    let stage = new CfnStage(
      this,
      "stage",
      {
        apiId: api.ref,
        deploymentId: deployment.ref,
        stageName: "Prod",
        description: "Prod Stage",
      },
    );

    new CfnOutput(
      this,
      "WebSocketURI",
      {
        description: "The WSS Protocol URI to connect to",
        value: `wss://${api.ref}.execute-api.${this.awsRegion}.amazonaws.com/${stage.ref}`,
      }
    );
    this.buildFrontend();
  }

  private buildFrontend() {
    let bucket = new Bucket(
      this,
      "FrontendBucket",
      {
        accessControl: BucketAccessControl.PUBLIC_READ,
        websiteIndexDocument: "index.html",
        removalPolicy: RemovalPolicy.DESTROY,
        cors: [{
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ["*"],
        }],
      });
    bucket.grantPublicAccess();

    let customDomainCertificate = Certificate.fromCertificateArn(
      this,
      'FrontendCustomDomainCertificate',
      this.customDomainCertificateArn,
    );

    const cloudFrontDistribution = new CloudFrontWebDistribution(
      this,
      'FrontendCloudFrontDistribution',
      {
        originConfigs: [{
          s3OriginSource: {
            s3BucketSource: bucket,
          },
          behaviors: [{isDefaultBehavior: true}],
        }],
        viewerCertificate: ViewerCertificate.fromAcmCertificate(
          customDomainCertificate,
          {
            aliases: [this.frontendCustomDomain],
          },
        ),
        errorConfigurations: [{
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html',
        }],
      },
    );

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(`../build-${this.frontendEnvironment}`)],
      destinationBucket: bucket,
      distribution: cloudFrontDistribution, // Invalidate CloudFront's cache
    });

    new CfnOutput(
      this,
      "FrontendCloudFrontDomain",
      {
        description: "The CloudFront URL for the frontend app (set a CNAME to point to this)",
        value: cloudFrontDistribution.domainName,
      },
    );

    new CfnOutput(
      this,
      "FrontendBucketPublicURL",
      {
        description: "The URL S3 bucket that hosts the frontend app",
        value: `https://${bucket.bucketName}.s3-${this.awsRegion}.amazonaws.com`,
      },
    );
  }

  private createIntegration(id: string, api: CfnApi, description: string, awsRegion: string, func: LambdaFunction) {
    return new CfnIntegration(
      this,
      id,
      {
        apiId: api.ref,
        description: description,
        integrationType: "AWS_PROXY",
        integrationUri: `arn:aws:apigateway:${awsRegion}:lambda:path/2015-03-31/functions/${func.functionArn}/invocations`
      },
    );
  }

  private createRoute(id: string, api: CfnApi, routeKey: string, operationName: string, integration: CfnIntegration) {
    return new CfnRoute(
      this,
      id,
      {
        apiId: api.ref,
        routeKey: routeKey,
        authorizationType: "NONE",
        operationName: operationName,
        target: `integrations/${integration.ref}`,
      },
    );
  }

  private createFunction(id: string, codeUri: string, api: CfnApi): LambdaFunction {
    let func = new LambdaFunction(
      this,
      id,
      {
        code: Code.fromAsset(codeUri),
        handler: "app.handler",
        memorySize: 256,
        runtime: Runtime.NODEJS_12_X,
      },
    );
    let permission = new CfnPermission(
      this,
      `${id}Permission`,
      {
        action: "lambda:InvokeFunction",
        principal: "apigateway.amazonaws.com",
        functionName: func.functionName,
      },
    );
    permission.addDependsOn(api);
    return func;
  }

  private createOnPlayerTtlFunction(codeUri: string, playersTable: Table): LambdaFunction {
    let func = new LambdaFunction(
      this,
      "OnPlayerTtlFunction",
      {
        code: Code.fromAsset(codeUri),
        handler: "app.handler",
        memorySize: 256,
        runtime: Runtime.NODEJS_12_X,
      },
    );
    func.addEventSource(new DynamoEventSource(playersTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      bisectBatchOnError: true,
      retryAttempts: 1,
    }));
    return func;
  }
}
