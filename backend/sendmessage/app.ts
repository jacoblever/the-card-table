import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult
} from "aws-lambda";
import { pushToConnection, pushToConnections } from "../common/pushMessage";
import { BackendCardState, databaseToBackendCard } from "../common/cards";
import {
  getCards,
  getConnection, getConnections,
  getPlayers,
  markConnectionAsStale,
  storeCardDrop,
  storeCardFlip
} from "../common/database";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let senderConnectionId = event.requestContext.connectionId;

  let body = JSON.parse(event.body);
  const actionString = body.data as string;
  const roomId = body.roomId as string;
  const action = JSON.parse(actionString);

  if(action.type === "GET_INITIAL_STATE") {
    let players = await getPlayers(roomId);
    let me = (await getConnection(senderConnectionId)).playerId;
    let cardState: BackendCardState = {
      cardsById: {},
      players: players.map(x => x.playerId),
      me: me,
    };
    let cards = await getCards(roomId);
    for (const dbCard of cards) {
      let card = databaseToBackendCard(dbCard);
      if(card.heldBy && card.heldBy !== me) {
        card.location = [0, 0];
      }
      cardState.cardsById[dbCard.cardId] = card;
     }
    let action = JSON.stringify({
      type: "INITIAL_CARD_STATE",
      state: cardState,
    });
    await pushToConnection(event.requestContext, senderConnectionId, action);
    return { statusCode: 200, body: 'Data sent.' };
  }

  let connections = await getConnections(roomId);
  let otherConnectionIds = connections
    .map(x => x.connectionId)
    .filter(id => id !== senderConnectionId);

  switch (action.type) {
    case "DROP_CARD":
      await storeCardDrop({
        roomId: roomId,
        cardId: action.cardId,
        newLocation: action.location,
        newZIndex: action.zIndex,
        newHeldBy: action.nowHeldBy,
      });
      break;
    case "TURN_OVER_CARD":
      await storeCardFlip({
        roomId: roomId,
        cardId: action.cardId,
      });
      break;
  }
  await pushToConnections(event.requestContext, otherConnectionIds, actionString);

  return { statusCode: 200, body: 'Data sent.' };
};
