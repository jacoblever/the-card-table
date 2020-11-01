type LambdaEnv = {
  PlayersTableName: string,
  ConnectionsTableName: string,
  CardsTableName: string,
  RoomTimeToLive: number,
}

export const getLambdaEnv: () => LambdaEnv = () => {
  return {
    PlayersTableName: process.env.TABLE_NAME_PLAYERS!,
    ConnectionsTableName: process.env.TABLE_NAME_CONNECTIONS!,
    CardsTableName: process.env.TABLE_NAME_CARDS!,
    RoomTimeToLive: parseInt(process.env.ROOM_TIME_TO_LIVE!),
  };
};
