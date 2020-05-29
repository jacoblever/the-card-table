import { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer } from "aws-lambda";
import { ApiGatewayManagementApi } from 'aws-sdk';
import { markConnectionAsStale } from "./database";

export const pushToConnection = async (
  requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  connectionId: string,
  postData: string,
  ) => {
  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: requestContext.domainName + '/' + requestContext.stage
  });

  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: postData,
  }).promise();
};

export const pushToConnections = async (
  requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  connectionIds: string[],
  action: string,
  ) => {
  const postCalls = connectionIds
    .map(async (connectionId) => {
      try {
        await pushToConnection(requestContext, connectionId, action)
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await markConnectionAsStale(connectionId);
        } else {
          throw e;
        }
      }
    });

  await Promise.all(postCalls);
};
