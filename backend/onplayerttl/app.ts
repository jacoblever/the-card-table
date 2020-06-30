import { deleteRoom, getPlayers } from "../common/database";
import { DynamoDBStreamEvent } from "aws-lambda/trigger/dynamodb-stream";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const actions = event.Records
    .map(async (record) => {
      if (record.eventName === 'REMOVE') {
        console.log('Stream record (REMOVE): ', JSON.stringify(record, null, 2));

        let roomId = record.dynamodb.Keys['roomId'].S;
        let playerId = record.dynamodb.Keys['playerId'].S;

        let otherPlayers = (await getPlayers(roomId))
          .filter(x => x.playerId !== playerId);

        if(otherPlayers.length === 0) {
          console.log(`No other players, deleting everything in room ${roomId}...`);
          await deleteRoom(roomId);
          console.log(`Room ${roomId} cleared`);
        } else {
          console.log(`Player ${playerId} in room ${roomId} deleted. But other players remain.`);
        }
      }
    });

  await Promise.all(actions);
};
