import { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer } from "aws-lambda";
import { ApiGatewayManagementApi } from 'aws-sdk';
import { BackendActionTypes } from "./backend_actions";
import { DbConnection } from "./database";

export const pushToConnection = async (
  requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  connectionId: string,
  action: BackendActionTypes,
  ) => {
  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: requestContext.domainName + '/' + requestContext.stage
  });

  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify(action),
  }).promise();
};

export async function pushToConnections(
  requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  connections: DbConnection[],
  action: BackendActionTypes,
  ): Promise<string[]> {
  let staleConnectionIds: string[] = []
  const postCalls = connections
    .filter(x => x.readyForActions)
    .map(async (connection) => {
      try {
        await pushToConnection(requestContext, connection.connectionId, action)
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connection.connectionId}`);
          staleConnectionIds.push(connection.connectionId);
        } else {
          throw e;
        }
      }
    });

  await Promise.all(postCalls);
  return staleConnectionIds;
}
