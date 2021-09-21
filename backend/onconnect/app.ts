import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DbCard,
  DbConnection,
  DbPlayer,
  deleteConnection,
  getConnections,
  getPlayers,
  putCards,
  putConnection,
  putPlayer,
  updatePlayerTimeToLive
} from "../common/database";
import { pushToConnections } from "../common/pushMessage";
import { INITIAL_PACK_LOCATION } from "../common/constants";
import { playerNames } from "./playerNames";
import { backendPlayersUpdate } from "../common/backend_actions";
import { getLambdaEnv } from "../common/env";
import { now } from "../common/time";

let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // eslint-disable-next-line
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

let getInitialCards = (roomId: string) => {
  let suits: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];
  let tidyOffset = 0.2;
  let cards = [];
  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.push({suit: suit, number: i });
    }
  }
  cards.sort(() => Math.random() - 0.5);
  return cards.map<DbCard>((x, i) => {
    return {
      cardId: uuidv4(),
      roomId: roomId,
      flipCount: 0,
      suit: x.suit,
      number: x.number,
      heldBy: null,
      location: [
        INITIAL_PACK_LOCATION[0] + tidyOffset * i - 52 * tidyOffset / 2,
        INITIAL_PACK_LOCATION[1] - tidyOffset * i + 52 * tidyOffset / 2
      ],
      zIndex: i,
    }
  });
}

function getPlayerNewName(existingPlayers: DbPlayer[]) {
  let existingPlayerNames = existingPlayers.map(x => x.name);
  let availablePlayerNames = playerNames.filter(x => !existingPlayerNames.includes(x))
  let randomIndex = Math.floor(Math.random() * availablePlayerNames.length);
  return availablePlayerNames[randomIndex];
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let roomId = event.queryStringParameters['room-id'].toLowerCase();
  let playerId = event.queryStringParameters['player-id'];
  let playerName = event.queryStringParameters['player-name'];
  let connectionId = event.requestContext.connectionId;

  let existingPlayers = await getPlayers(roomId);
  let existingConnections = await getConnections(roomId);

  let players: DbPlayer[] = existingPlayers;
  if(playerId === "NewPlayer") {
    playerId = uuidv4();
    let name = playerName !== "" ? playerName : getPlayerNewName(existingPlayers);
    let newPlayer: DbPlayer = {
      roomId: roomId,
      playerId: playerId,
      name: name,
      playOrder: existingPlayers.length,
      timeToLive: now() + getLambdaEnv().RoomTimeToLive
    };
    await putPlayer(newPlayer);
    players = [...existingPlayers, newPlayer];
  } else if (existingPlayers.filter(p => p.playerId === playerId).length === 0) {
    return { statusCode: 403, body: 'player id not in room' };
  } else {
    await updatePlayerTimeToLive({
      roomId: roomId,
      playerId: playerId,
      timeToLive: now() + getLambdaEnv().RoomTimeToLive,
    });
  }

  let newRoom = existingPlayers.length === 0;
  if (newRoom) {
    await putCards(getInitialCards(roomId));
  }

  let newConnection: DbConnection = {
    roomId: roomId,
    connectionId: connectionId,
    playerId: playerId,
    readyForActions: false,
  };
  await putConnection(newConnection);

  let connections = [...existingConnections, newConnection];

  let staleConnectionIds = await pushToConnections(
    event.requestContext,
    existingConnections,
    backendPlayersUpdate(players, connections),
  );

  if(staleConnectionIds.length > 0) {
    staleConnectionIds.forEach(x => {
      deleteConnection(roomId, x);
    });

    let connectionsLeft = connections.filter(x => !staleConnectionIds.includes(x.connectionId));
    await pushToConnections(
      event.requestContext,
      connectionsLeft,
      backendPlayersUpdate(await getPlayers(roomId), connectionsLeft),
    );
  }
  return { statusCode: 200, body: 'Connected.' };
};
