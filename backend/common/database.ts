import { getLambdaEnv } from "./env";
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

type DbConnection = {
  roomId: string;
  connectionId: string;
  playerId: string;
}

export interface DatabaseCard {
  cardId: string;
  roomId: string;
  faceUp: boolean;
  suit: 0 | 1 | 2 | 3;
  number: number;
  heldBy: null;
  location: [number, number];
  zIndex: number;
}

export const getConnections = async (roomId: string) => {
  let result = await ddb.query({
    TableName: getLambdaEnv().ConnectionsTableName,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId,
    }
  }).promise();

  return result.Items.map<DbConnection>(x => {
    return {
      roomId: x['roomId'],
      connectionId: x['connectionId'],
      playerId: x['playerId'],
    };
  });
};

// let getConnection = async (roomId: string, connectionId: string) => {
//   return await ddb.query({
//     TableName: lambdaEnv.ConnectionsTableName,
//     KeyConditionExpression: 'roomId = :roomId AND connectionId = :connectionId',
//     ExpressionAttributeValues: {
//       ':roomId': roomId,
//       ':connectionId': connectionId,
//     }
//   }).promise();
// }

export const putConnection = async (connection: DbConnection) => {
  await ddb.put({
    TableName: getLambdaEnv().ConnectionsTableName,
    Item: connection,
  }).promise();
};

export const markConnectionAsStale = async (roomId: string, connectionId: string) => {
  await ddb.delete({
    TableName: getLambdaEnv().ConnectionsTableName,
    Key: {
      roomId: roomId,
      connectionId: connectionId,
    },
  }).promise();
};

export const getCards = async (roomId: string) => {
  let result = await ddb.query({
    TableName: getLambdaEnv().CardsTableName,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId,
    }
  }).promise();

  return result.Items.map<DatabaseCard>(card => {
    return {
      cardId: card['cardId'],
      roomId: card['roomId'],
      faceUp: card['faceUp'],
      suit: card['suit'],
      number: card['number'],
      heldBy: card['heldBy'],
      location: card['location'],
      zIndex: card['zIndex'],
    };
  });
};

export const putCards = async (cards: DatabaseCard[]) => {
  let cardsTableName = getLambdaEnv().CardsTableName;
  let requestItems: DynamoDB.DocumentClient.BatchWriteItemRequestMap = {};
  requestItems[cardsTableName] = cards.map(card => {
    return {
      PutRequest: {
        Item: card,
      },
    }
  });
  await ddb.batchWrite({
    RequestItems: requestItems,
  }).promise();
}
