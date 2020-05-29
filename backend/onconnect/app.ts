import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DatabaseCard,
  DbPlayer,
  getConnections,
  getPlayers,
  putCards,
  putConnection,
  putPlayer
} from "../common/database";
import { pushToConnections } from "../common/pushMessage";

let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // eslint-disable-next-line
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

let getInitialCards = (roomId: string) => {
  let cards: DatabaseCard[] = [];
  let suits: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];
  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.push({
        cardId: uuidv4(),
        roomId: roomId,
        flipCount: 0,
        suit: suit,
        number: i,
        heldBy: null,
        location: [300, 150],
        zIndex: 0,
      });
    }
  }
  cards.sort(() => Math.random() - 0.5);
  for (let i = 0; i < cards.length; i++) {
    cards[i].zIndex = i;
  }
  return cards;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let roomId = event.queryStringParameters['room-id'];
  let playerId = event.queryStringParameters['player-id'];
  let connectionId = event.requestContext.connectionId;

  let existingPlayers = await getPlayers(roomId);
  let existingConnections = await getConnections(roomId);

  if(playerId === "NewPlayer") {
    playerId = uuidv4();
    let newPlayer: DbPlayer = {
      roomId: roomId,
      playerId: playerId,
    };
    await putPlayer(newPlayer);
    await pushToConnections(event.requestContext, existingConnections.map(x => x.connectionId), JSON.stringify({
      type: "PLAYERS_UPDATE",
      players: [...existingPlayers, newPlayer].map(x => x.playerId),
    }))
  } else if (existingPlayers.filter(p => p.playerId === playerId).length === 0) {
    return { statusCode: 403, body: 'player id not in room' };
  }

  let newRoom = existingPlayers.length === 0;
  if (newRoom) {
    let cards = getInitialCards(roomId);
    await putCards(cards.slice(0,25));
    await putCards(cards.slice(25,50));
    await putCards(cards.slice(50));
  }

  await putConnection({
    roomId: roomId,
    connectionId: connectionId,
    playerId: playerId,
  })

  return { statusCode: 200, body: 'Connected.' };
};
