import { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer } from "aws-lambda";
import { ApiGatewayManagementApi } from 'aws-sdk';

export const pushMessage = async (
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
