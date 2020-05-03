import React from 'react';

import './CardTableComponent.css';
import CardContainer from './CardContainer';
import { Card } from './store/types';

import { WebSocketConnection } from './server/WebSocketConnection'

type CardTableProps = {
  cards: { [key: string]: Card; }
  onRemoteEvent: (event: MessageEvent) => void
}

class CardTableComponent extends React.Component<CardTableProps, {}> {
  private _webSocketConnection: WebSocketConnection;

  constructor(props: any) {
    super(props);
    this.state = {}

    this._webSocketConnection = new WebSocketConnection(this.props.onRemoteEvent);
  }

  componentDidMount() {
    this._webSocketConnection.connect();
  }

  componentWillUnmount() {
    this._webSocketConnection.close();
  }

  render() {
    const cards = []

    for (const id of Object.keys(this.props.cards)) {
      let card = this.props.cards[id];
      cards.push(
        <CardContainer
          id={id}
          key={id}
          faceUp={card.faceUp}
          suit={card.suit}
          number={card.number}
          zIndex={card.zIndex}
        />
      )
    }

    return (
      <div className="table">        
        {cards}
      </div>
    );
  }
}

export default CardTableComponent;
