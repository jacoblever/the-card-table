import React from 'react';
import HiddenSvgCardsComponent from './HiddenSvgCardsComponent';
import CardTableContainer from './CardTableContainer';
import { LobbyContainer } from "./LobbyContainer";

type AppProps = {
  roomId: string | null,
}

function mainComponent(roomId: string | null): JSX.Element {
  if(roomId === null) {
    return <LobbyContainer />;
  } else {
    return <CardTableContainer />;
  }
}

function App({ roomId }: AppProps) {
  return (
    <div className="app">
      <HiddenSvgCardsComponent />
      {mainComponent(roomId)}
    </div>
  );
}
export default App;
