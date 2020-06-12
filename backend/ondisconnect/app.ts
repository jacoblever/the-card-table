// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html
// The $disconnect route is executed after the connection is closed.
// The connection can be closed by the server or by the client. As the connection is already closed when it is executed, 
// $disconnect is a best-effort event. 
// API Gateway will try its best to deliver the $disconnect event to your integration, but it cannot guarantee delivery.

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteConnection, getConnection, getConnections, getPlayers } from "../common/database";
import { pushToConnections } from "../common/pushMessage";
import { backendPlayersUpdate } from "../common/backend_actions";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let connection = await getConnection(event.requestContext.connectionId);
  if(connection === null) {
    return { statusCode: 200, body: 'Already deleted.' };
  }

  await deleteConnection(connection.roomId, connection.connectionId);

  let players = await getPlayers(connection.roomId);
  let connections = await getConnections(connection.roomId);
  await pushToConnections(
    event.requestContext,
    connections,
    backendPlayersUpdate(players, connections),
  );

  return { statusCode: 200, body: 'Disconnected.' };
};
