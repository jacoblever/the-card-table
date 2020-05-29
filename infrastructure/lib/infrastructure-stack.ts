import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage } from '@aws-cdk/aws-apigatewayv2'
import { CfnPermission, Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { AttributeType, ProjectionType, Table, TableEncryption } from '@aws-cdk/aws-dynamodb'
import { exec } from 'child_process'
import { promisify } from 'util';

const execAsync = promisify(exec);

export class InfrastructureStack extends cdk.Stack {
  private readonly awsRegion: string;
  private readonly awsAccountId: string;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.awsRegion = props?.env?.region!;
    this.awsAccountId = props?.env?.account!;
  }

  public async buildStack() {
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
        readCapacity: 5,
        writeCapacity: 5,
        encryption: TableEncryption.AWS_MANAGED,
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

    let connectFunction = await this.createFunction("OnConnectFunction", "../backend/onconnect/", api);
    let disconnectFunction = await this.createFunction("DisconnectFunction", "../backend/ondisconnect/", api);
    let sendFunction = await this.createFunction("SendFunction", "../backend/sendmessage/", api);

    [connectFunction, disconnectFunction, sendFunction].forEach(f => {
      playersTable.grantReadWriteData(f);
      connectionsTable.grantReadWriteData(f);
      cardsTable.grantReadWriteData(f);
      f.addEnvironment("TABLE_NAME_PLAYERS", playersTable.tableName);
      f.addEnvironment("TABLE_NAME_CONNECTIONS", connectionsTable.tableName);
      f.addEnvironment("TABLE_NAME_CARDS", cardsTable.tableName);
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

  private async createFunction(id: string, codeUri: string, api: CfnApi) {
    let buildCommands = [
      `cd ${codeUri}`,
      `cp ../build.sh ./`,
      `./build.sh`,
      `rm build.sh`,
    ];
    await execAsync(buildCommands.join(' && ')).then(
      r => console.log(`${id} (${codeUri}) compiled`)
    );

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
}
