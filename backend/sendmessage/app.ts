import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult
} from "aws-lambda";
import { pushToConnection, pushToConnections } from "../common/pushMessage";
import {
  BackendCardState,
  databaseToBackendCard
} from "../common/backend_state";
import {
  DbConnection,
  deleteConnection,
  deletePlayer,
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
  BACKEND_INITIAL_CARD_STATE, BACKEND_KICK_PLAYER,
  BACKEND_NAME_CHANGE,
  BACKEND_TURN_OVER_CARD,
  BackendActionTypes, backendDropCardOnTable,
  BackendInitialCardStateAction, BackendKickPlayerAction, backendPlayersUpdate, backendTurnCardOverTable
} from "../common/backend_actions";

async function asyncForEach<T>(array: T[], callback: (item: T, index: number, array: T[]) => void) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function movePlayersCardsToTable(
  roomId: string,
  action: BackendKickPlayerAction,
  event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>,
  connections: DbConnection[],
) {
  let playersCards = (await getCards(roomId))
    .filter(x => x.heldBy === action.playerId);
  await asyncForEach(playersCards, async (card, i) => {
    if (card.flipCount % 2 === 1) {
      let flipAction = backendTurnCardOverTable(card.cardId);
      await storeCardFlip({
        roomId: roomId,
        cardId: flipAction.cardId,
      });
      await pushToConnections(
        event.requestContext,
        connections.map(x => x.connectionId),
        flipAction,
      );
    }
    let dropAction = backendDropCardOnTable(card.cardId);
    await storeCardDrop({
      roomId: roomId,
      cardId: dropAction.cardId,
      newLocation: dropAction.location,
      newZIndex: dropAction.zIndex,
      newHeldBy: dropAction.nowHeldBy,
    });
    await pushToConnections(
      event.requestContext,
      connections.map(x => x.connectionId),
      dropAction,
    );
  });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let senderConnectionId = event.requestContext.connectionId;

  let body = JSON.parse(event.body);
  const actionString = body.data as string;
  const roomId = body.roomId as string;
  const action: BackendActionTypes = JSON.parse(actionString);

  let connections = await getConnections(roomId);

  if(action.type === BACKEND_GET_INITIAL_STATE) {
    let players = await getPlayers(roomId);
    let me = (await getConnection(senderConnectionId)).playerId;
    let cardState: BackendCardState = {
      cardsById: {},
      players: backendPlayersUpdate(await getPlayers(roomId), connections).players,
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
  let sendToSelf = false;
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
      actionToSend = backendPlayersUpdate(await getPlayers(roomId), connections);
      break;
    case BACKEND_KICK_PLAYER:
      await deletePlayer(roomId, action.playerId,);
      await movePlayersCardsToTable(roomId, action, event, connections);

      // This is hacky, we want to clients to have already moved the cards to the table
      // before we remove the player
      await sleep(700);

      actionToSend = backendPlayersUpdate(await getPlayers(roomId), connections);
      sendToSelf = true;
      break;
    default:
      throw new Error(`Action type ${action.type} not handled by backend`);
  }

  let otherConnectionIds = connections
    .map(x => x.connectionId);
  if(!sendToSelf) {
    otherConnectionIds = otherConnectionIds
      .filter(id => id !== senderConnectionId);
  }

  let staleConnectionIds = await pushToConnections(event.requestContext, otherConnectionIds, actionToSend);

  if(staleConnectionIds.length > 0) {
    staleConnectionIds.forEach(x => {
      deleteConnection(roomId, x);
    });

    let connectionsLeft = connections.filter(x => !staleConnectionIds.includes(x.connectionId));
    await pushToConnections(
      event.requestContext,
      connectionsLeft.map(x => x.connectionId),
      backendPlayersUpdate(await getPlayers(roomId), connectionsLeft),
    );
  }
  return { statusCode: 200, body: 'OK' };
};
