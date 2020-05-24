import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getLambdaEnv } from "./common/env";

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
const roomId = "TestRoom";

const connectionsTableName = getLambdaEnv().ConnectionsTableName;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let connectionData;
  
  try {
    connectionData = await ddb.scan({
      TableName: connectionsTableName,
      ProjectionExpression: 'connectionId',
    }).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const postData = JSON.parse(event.body).data;
  
  const postCalls = connectionData.Items
    .filter(item => item['connectionId'] !== event.requestContext.connectionId)
    .map(async (item) => {
      let connectionId = item['connectionId'];
      try {
        if (connectionId !== event.requestContext.connectionId) {
          await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
        }
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await ddb.delete({
            TableName: connectionsTableName,
            Key: {
              roomId: roomId,
              connectionId: connectionId,
            },
          }).promise();
        } else {
          throw e;
        }
      }
    });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
