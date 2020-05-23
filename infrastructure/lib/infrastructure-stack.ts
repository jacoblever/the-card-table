import * as cdk from '@aws-cdk/core';
import { CfnOutput, Construct } from '@aws-cdk/core';
import { CfnApi, CfnDeployment, CfnIntegration, CfnRoute, CfnStage } from '@aws-cdk/aws-apigatewayv2'
import { CfnPermission, Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda'
import { Effect, PolicyStatement } from '@aws-cdk/aws-iam'
import { AttributeType, ProjectionType, Table, TableEncryption } from '@aws-cdk/aws-dynamodb'

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let awsRegion = props?.env?.region!;
    let awsAccountId = props?.env?.account!;

    let api = new CfnApi(
      this,
      "api",
      {
        name: "TheCardRoomWebSocketApi",
        protocolType: "WEBSOCKET",
        routeSelectionExpression: "$request.body.message",
      },
    );

    let connectionsTable = new Table(
      this,
      'ConnectionsTable',
      {
        partitionKey: {
          name: 'connectionId',
          type: AttributeType.STRING,
        },
        readCapacity: 5,
        writeCapacity: 5,
        encryption: TableEncryption.AWS_MANAGED,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    let connectFunction = InfrastructureStack.createFunction(this, "OnConnectFunction", "../onconnect/", api);
    let disconnectFunction = InfrastructureStack.createFunction(this, "DisconnectFunction", "../ondisconnect/", api);
    let sendFunction = InfrastructureStack.createFunction(this, "SendFunction", "../sendmessage/", api);

    [connectFunction, disconnectFunction, sendFunction].forEach(f => {
      connectionsTable.grantReadWriteData(f);
      f.addEnvironment("TABLE_NAME", connectionsTable.tableName);
    });

    sendFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["execute-api:ManageConnections"],
      resources: [`arn:aws:execute-api:${awsRegion}:${awsAccountId}:${api.ref}/*`],
    }));

    let connectIntegration = InfrastructureStack.createIntegration(this, "ConnectIntegration", api, "Connect Integration", awsRegion, connectFunction);
    let disconnectIntegration = InfrastructureStack.createIntegration(this, "DisconnectIntegration", api, "Disconnect Integration", awsRegion, disconnectFunction);
    let sendIntegration = InfrastructureStack.createIntegration(this, "SendIntegration", api, "Send Integration", awsRegion, sendFunction);

    let connectRoute = InfrastructureStack.createRoute(this, "ConnectRoute", api, "$connect", "ConnectRoute", connectIntegration);
    let disconnectRoute = InfrastructureStack.createRoute(this, "DisconnectRoute", api, "$disconnect", "DisconnectRoute", disconnectIntegration);
    let sendRoute = InfrastructureStack.createRoute(this, "SendRoute", api, "sendmessage", "SendRoute", sendIntegration);

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
        value: `wss://${api.ref}.execute-api.${awsRegion}.amazonaws.com/${stage.ref}`,
      }
    );
  }

  private static createIntegration(scope: Construct, id: string, api: CfnApi, description: string, awsRegion: string, func: LambdaFunction) {
    return new CfnIntegration(
      scope,
      id,
      {
        apiId: api.ref,
        description: description,
        integrationType: "AWS_PROXY",
        integrationUri: `arn:aws:apigateway:${awsRegion}:lambda:path/2015-03-31/functions/${func.functionArn}/invocations`
      },
    );
  }

  private static createRoute(scope: Construct, id: string, api: CfnApi, routeKey: string, operationName: string, integration: CfnIntegration) {
    return new CfnRoute(
      scope,
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

  private static createFunction(scope: Construct, id: string, codeUri: string, api: CfnApi) {
    let func = new LambdaFunction(
      scope,
      id,
      {
        code: Code.fromAsset(codeUri),
        handler: "app.handler",
        memorySize: 256,
        runtime: Runtime.NODEJS_12_X,
      },
    );
    let permission = new CfnPermission(
      scope,
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
