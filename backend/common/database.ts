import { getLambdaEnv } from "./env";
import { DynamoDB } from 'aws-sdk';

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

type DbConnection = {
  roomId: string;
  connectionId: string;
  playerId: string;
}

export type DatabaseCard = {
  cardId: string;
  roomId: string;
  flipCount: number; // odd means face up, even means face down
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

  let items = result.Items;
  if(!items){
    return [];
  }
  return items.map<DbConnection>(x => {
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

  let items = result.Items;
  if(!items){
    return [];
  }
  return items.map<DatabaseCard>(card => {
    return {
      cardId: card['cardId'],
      roomId: card['roomId'],
      flipCount: card['flipCount'],
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
};

type CardDrop = {
  roomId: string;
  cardId: string;
  newLocation: [number, number];
  newZIndex: number;
  newHeldBy: string | null;
}

export const storeCardDrop = async (cardDrop: CardDrop) => {
  await ddb.update({
    TableName: getLambdaEnv().CardsTableName,
    Key: {
      roomId: cardDrop.roomId,
      cardId: cardDrop.cardId,
    },
    UpdateExpression: 'set #l = :newLocation, zIndex = :newZIndex, heldBy = :newHeldBy',
    ExpressionAttributeNames: {
      '#l': 'location',
    },
    ExpressionAttributeValues: {
      ':newHeldBy': cardDrop.newHeldBy,
      ':newLocation': cardDrop.newLocation,
      ':newZIndex': cardDrop.newZIndex,
    }
  }).promise();
};

type CardFlip = {
  roomId: string;
  cardId: string;
}

export const storeCardFlip = async (cardFlip: CardFlip) => {
  await ddb.update({
    TableName: getLambdaEnv().CardsTableName,
    Key: {
      roomId: cardFlip.roomId,
      cardId: cardFlip.cardId,
    },
    UpdateExpression: 'add flipCount :one',
    ExpressionAttributeValues: {
      ':one': 1,
    }
  }).promise();
};
