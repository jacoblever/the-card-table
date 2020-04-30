import React from 'react';

import './CardTableComponent.css';
import CardContainer from './CardContainer';
import { Card } from './store/types'

type CardTableProps = {
  cards: { [key: string]: Card; }
}

class CardTableComponent extends React.Component<CardTableProps, {}> {
  constructor(props: any) {
    super(props);
    this.state = {}
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
