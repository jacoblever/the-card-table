import { DynamoDB } from 'aws-sdk';
import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
  APIGatewayProxyResult
} from "aws-lambda";
import { getLambdaEnv } from "../common/env";
import { pushMessage } from "../common/pushMessage";
import { BackendCard, BackendCardState } from "../common/cards";

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
const roomId = "TestRoom";

const connectionsTableName = getLambdaEnv().ConnectionsTableName;

let getConnections = async () => {
  return await ddb.query({
    TableName: connectionsTableName,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId,
    }
  }).promise();
}

let pushToConnections = async (connectionIds: any[], event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>, action: string) => {
  const postCalls = connectionIds
    .map(async (connectionId) => {
      try {
        await pushMessage(event.requestContext, connectionId, action)
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await ddb.delete({
            TableName: connectionsTableName,
            Key: {
              roomId: roomId,
              connectionId: connectionId,
            },
          }).promise();
        } else {
          throw e;
        }
      }
    });

  await Promise.all(postCalls);
}

let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    // eslint-disable-next-line
    let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

let getInitialCardState = () => {
  let cards: BackendCard[] = [];
  let suits: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];
  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.push({
        id: uuidv4(),
        faceUp: false,
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
    const card = cards[i];
    card.zIndex = i;
  }
  let cardState: BackendCardState = {
    cardsById: {},
    players: ["a", "b", "c"],
    me: "a",
  }
  for (const card of cards) {
    cardState.cardsById[card.id] = card;
  }
  return cardState;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let senderConnectionId = event.requestContext.connectionId;

  const action: string = JSON.parse(event.body).data;

  if(JSON.parse(action).type === "GET_INITIAL_STATE") {
    let action = JSON.stringify({
      type: "INITIAL_CARD_STATE",
      state: getInitialCardState(),
    });
    await pushMessage(event.requestContext, senderConnectionId, action);
    return { statusCode: 200, body: 'Data sent.' };
  }

  let connectionData = await getConnections();

  let otherConnectionIds = connectionData.Items
    .map(item => item['connectionId'])
    .filter(id => id !== event.requestContext.connectionId);

  await pushToConnections(otherConnectionIds, event, action);

  return { statusCode: 200, body: 'Data sent.' };
};
