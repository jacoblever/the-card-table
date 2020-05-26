import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult
} from "aws-lambda";
import { pushMessage } from "../common/pushMessage";
import { BackendCardState, databaseToBackendCard } from "../common/cards";
import { getCards, getConnections, markConnectionAsStale } from "../common/database";

let pushToConnections = async (roomId: string, connectionIds: any[], event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>, action: string) => {
  const postCalls = connectionIds
    .map(async (connectionId) => {
      try {
        await pushMessage(event.requestContext, connectionId, action)
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await markConnectionAsStale(roomId, connectionId);
        } else {
          throw e;
        }
      }
    });

  await Promise.all(postCalls);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let senderConnectionId = event.requestContext.connectionId;

  let body = JSON.parse(event.body);
  const action = body.data as string;
  const roomId = body.roomId as string;

  if(JSON.parse(action).type === "GET_INITIAL_STATE") {
    let connections = await getConnections(roomId);
    let me = connections.filter(x => x.connectionId === senderConnectionId)[0].playerId;
    let cardState: BackendCardState = {
      cardsById: {},
      players: [...new Set(connections.map(x => x.playerId))],
      me: me,
    };
    let cards = await getCards(roomId);
    for (const card of cards) {
       cardState.cardsById[card.cardId] = databaseToBackendCard(card);
     }
    let action = JSON.stringify({
      type: "INITIAL_CARD_STATE",
      state: cardState,
    });
    await pushMessage(event.requestContext, senderConnectionId, action);
    return { statusCode: 200, body: 'Data sent.' };
  }

  let connections = await getConnections(roomId);
  let otherConnectionIds = connections
    .map(x => x.connectionId)
    .filter(id => id !== event.requestContext.connectionId);

  await pushToConnections(roomId, otherConnectionIds, event, action);

  return { statusCode: 200, body: 'Data sent.' };
};
