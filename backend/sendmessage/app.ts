import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { pushToConnection, pushToConnections } from "../common/pushMessage";
import {
  BackendCardState,
  databaseToBackendCard,
  databaseToBackendPlayer
} from "../common/backend_state";
import {
  getCards,
  getConnection,
  getConnections,
  getPlayers,
  renamePlayer,
  storeCardDrop,
  storeCardFlip
} from "../common/database";
import {
  BACKEND_DROP_CARD,
  BACKEND_GET_INITIAL_STATE,
  BACKEND_INITIAL_CARD_STATE,
  BACKEND_NAME_CHANGE,
  BACKEND_PLAYERS_UPDATE,
  BACKEND_TURN_OVER_CARD,
  BackendActionTypes,
  BackendInitialCardStateAction
} from "../common/backend_actions";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let senderConnectionId = event.requestContext.connectionId;

  let body = JSON.parse(event.body);
  const actionString = body.data as string;
  const roomId = body.roomId as string;
  const action: BackendActionTypes = JSON.parse(actionString);

  if(action.type === BACKEND_GET_INITIAL_STATE) {
    let players = await getPlayers(roomId);
    let me = (await getConnection(senderConnectionId)).playerId;
    let cardState: BackendCardState = {
      cardsById: {},
      players: players.map(databaseToBackendPlayer),
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
    let action: BackendInitialCardStateAction = {
      type: BACKEND_INITIAL_CARD_STATE,
      state: cardState,
    };
    await pushToConnection(event.requestContext, senderConnectionId, action);
    return { statusCode: 200, body: 'Data sent.' };
  }

  let actionToSend: BackendActionTypes = action;
  switch (action.type) {
    case BACKEND_DROP_CARD:
      await storeCardDrop({
        roomId: roomId,
        cardId: action.cardId,
        newLocation: action.location,
        newZIndex: action.zIndex,
        newHeldBy: action.nowHeldBy,
      });
      break;
    case BACKEND_TURN_OVER_CARD:
      await storeCardFlip({
        roomId: roomId,
        cardId: action.cardId,
      });
      break;
    case BACKEND_NAME_CHANGE:
      await renamePlayer({
        roomId: roomId,
        playerId: action.playerId,
        name: action.name,
      });
      actionToSend = {
        type: BACKEND_PLAYERS_UPDATE,
        players: (await getPlayers(roomId)).map(databaseToBackendPlayer),
      }
      break;
    default:
      throw new Error(`Action type ${action.type} not handled by backend`);
  }

  let connections = await getConnections(roomId);
  let otherConnectionIds = connections
    .map(x => x.connectionId)
    .filter(id => id !== senderConnectionId);
  await pushToConnections(event.requestContext, otherConnectionIds, actionToSend);

  return { statusCode: 200, body: 'OK' };
};
