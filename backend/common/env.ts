type LambdaEnv = {
  ConnectionsTableName: string,
  CardsTableName: string,
}

export const getLambdaEnv: () => LambdaEnv = () => {
  return {
    ConnectionsTableName: process.env.TABLE_NAME_CONNECTIONS!,
    CardsTableName: process.env.TABLE_NAME_CARDS!,
  }
}
