// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html
// The $disconnect route is executed after the connection is closed.
// The connection can be closed by the server or by the client. As the connection is already closed when it is executed, 
// $disconnect is a best-effort event. 
// API Gateway will try its best to deliver the $disconnect event to your integration, but it cannot guarantee delivery.

import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const deleteParams = {
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId
    }
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};
