import { getLambdaEnv } from "./env";
import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

const ddb = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

export type DbPlayer = {
  /** partition key */
  roomId: string;
  /** sort key */
  playerId: string;
  name: string;
  playOrder: number;
};

export type DbConnection = {
  /** partition key */
  connectionId: string;
  roomId: string;
  playerId: string;
  readyForActions: boolean;
};

export type DbCard = {
  /** sort key */
  cardId: string;
  /** partition key */
  roomId: string;
  flipCount: number; // odd means face up, even means face down
  suit: 0 | 1 | 2 | 3;
  number: number;
  heldBy: null;
  location: [number, number];
  zIndex: number;
};

export const putPlayer = async (player: DbPlayer) => {
  await ddb.put({
    TableName: getLambdaEnv().PlayersTableName,
    Item: player,
  }).promise();
};

export const getPlayers = async (roomId: string) => {
  let result = await ddb.query({
    TableName: getLambdaEnv().PlayersTableName,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId,
    }
  }).promise();

  let items = result.Items;
  if(!items){
    return [];
  }
  let dbPlayers = items.map<DbPlayer>(x => {
    return {
      roomId: x['roomId'],
      playerId: x['playerId'],
      name: x['name'],
      playOrder: x['playOrder'],
    };
  });
  dbPlayers.sort(x => x.playOrder);
  return dbPlayers;
};

export const putConnection = async (connection: DbConnection) => {
  await ddb.put({
    TableName: getLambdaEnv().ConnectionsTableName,
    Item: connection,
  }).promise();
};

export async function getConnection(connectionId: string): Promise<DbConnection | null> {
  let result = await ddb.query({
    TableName: getLambdaEnv().ConnectionsTableName,
    IndexName: 'findByConnectionId',
    KeyConditionExpression: 'connectionId = :connectionId',
    ExpressionAttributeValues: {
      ':connectionId': connectionId,
    }
  }).promise();

  let items = result.Items;
  if(!items || items.length === 0) {
    return null;
  }
  let item = items[0];
  return {
    connectionId: item['connectionId'],
    roomId: item['roomId'],
    playerId: item['playerId'],
    readyForActions: item['readyForActions'],
  };
};

export const getConnections = async (roomId: string) => {
  let result = await ddb.query({
    TableName: getLambdaEnv().ConnectionsTableName,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId,
    }
  }).promise();

  let items = result.Items;
  if(!items) {
    return [];
  }
  return items.map<DbConnection>(item => {
    return {
      connectionId: item['connectionId'],
      roomId: item['roomId'],
      playerId: item['playerId'],
      readyForActions: item['readyForActions'],
    };
  });
};

export const deleteConnection = async (roomId: string, connectionId: string) => {
  await ddb.delete({
    TableName: getLambdaEnv().ConnectionsTableName,
    Key: {
      roomId: roomId,
      connectionId: connectionId,
    },
  }).promise();
};

type ConnectionReadyForActions = {
  roomId: string;
  connectionId: string;
}

export const markConnectionReadyForActions = async (connectionReadyForActions: ConnectionReadyForActions) => {
  await ddb.update({
    TableName: getLambdaEnv().ConnectionsTableName,
    Key: {
      roomId: connectionReadyForActions.roomId,
      connectionId: connectionReadyForActions.connectionId,
    },
    UpdateExpression: 'set readyForActions = :true',
    ExpressionAttributeValues: {
      ':true': true,
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
  return items.map<DbCard>(card => {
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

export const putCards = async (cards: DbCard[]) => {
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
  turnOver?: boolean;
}

export const storeCardDrop = async (cardDrop: CardDrop) => {
  let params: DocumentClient.UpdateItemInput = {
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
    },
  };
  if(cardDrop.turnOver) {
    params.UpdateExpression += ' add flipCount :one';
    params.ExpressionAttributeValues[':one'] = 1;
  }
  await ddb.update(params).promise();
};

type RenamePlayer = {
  roomId: string;
  playerId: string;
  name: string;
}

export const renamePlayer = async (renamePlayer: RenamePlayer) => {
  await ddb.update({
    TableName: getLambdaEnv().PlayersTableName,
    Key: {
      roomId: renamePlayer.roomId,
      playerId: renamePlayer.playerId,
    },
    UpdateExpression: 'set #n = :newName',
    ExpressionAttributeNames: {
      '#n': 'name'
    },
    ExpressionAttributeValues: {
      ':newName': renamePlayer.name,
    }
  }).promise();
};

export const deletePlayer = async (roomId: string, playerId: string) => {
  await ddb.delete({
    TableName: getLambdaEnv().PlayersTableName,
    Key: {
      roomId: roomId,
      playerId: playerId,
    },
  }).promise();
};
