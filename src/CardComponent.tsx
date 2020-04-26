import React from 'react';

import { Suit } from './Suit';
import './CardComponent.css';

type CardProps = {
  id: string,
  suit: Suit,
  number: number,
  faceUp: boolean,
  zIndex: number,
}

type CardState = {
}

class CardComponent extends React.Component<CardProps, CardState> {
  constructor(props: any) {
    super(props);
    this.state = {}
  }

  private cardName(): string {
    if (this.props.faceUp) {
      return `${this.suitName()}_${this.cardFace()}`
    }
    return "back";
  }

  private suitName(): string {
    switch (this.props.suit) {
      case Suit.Clubs:
        return "club";
      case Suit.Diamonds:
        return "diamond";
      case Suit.Hearts:
        return "heart";
      case Suit.Spades:
        return "spade";
      default:
        throw new Error();
    }
  }

  private cardFace(): string {
    switch (this.props.number) {
      case 11:
        return "jack";
      case 12:
        return "queen";
      case 13:
        return "king";
      default:
        return this.props.number.toString();
    }
  }
   
  render() {
    return (
      <div className="card" id={this.props.id} style={{ zIndex: this.props.zIndex }}>
        <svg width="100%" viewBox="0 0 169.075 244.64">
          <use xlinkHref={`#${this.cardName()}`} />
        </svg>
      </div>
    );
  }
}

export default CardComponent;
