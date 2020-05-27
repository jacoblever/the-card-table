import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DatabaseCard, getConnections, putCards, putConnection } from "../common/database";

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

  let existingPlayerConnections = await getConnections(roomId);

  if(playerId === "NewPlayer") {
    playerId = uuidv4();
  // } else if (existingPlayerConnections.Items.filter(c => c['playerId'] === playerId).length === 0) {
  //   return { statusCode: 403, body: 'player id not in room' };
  }

  if (existingPlayerConnections.length === 0) {
    let cards = getInitialCards(roomId);
    await putCards(cards.slice(0,25));
    await putCards(cards.slice(25,50));
    await putCards(cards.slice(50));
  }

  let connectionId = event.requestContext.connectionId;
  await putConnection({
    roomId: roomId,
    connectionId: connectionId,
    playerId: playerId,
  })

  return { statusCode: 200, body: 'Connected.' };
};
