// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html
// The $disconnect route is executed after the connection is closed.
// The connection can be closed by the server or by the client. As the connection is already closed when it is executed, 
// $disconnect is a best-effort event. 
// API Gateway will try its best to deliver the $disconnect event to your integration, but it cannot guarantee delivery.

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { markConnectionAsStale } from "../common/database";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await markConnectionAsStale(event.requestContext.connectionId);
  return { statusCode: 200, body: 'Disconnected.' };
};
