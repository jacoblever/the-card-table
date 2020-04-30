import React from 'react';

import interact from 'interactjs'
import '@interactjs/types'

import { Suit } from './Suit';
import './CardComponent.css';

export type CardProps = {
  id: string,
  location: number[],
  suit: Suit,
  number: number,
  faceUp: boolean,
  zIndex: number,

  onClick: () => void,
  onPickUp: () => void,
  onMove: (x: number, y: number) => void,
  onDrop: (x: number, y: number) => void,
}

type CardState = {
}

export class CardComponent extends React.Component<CardProps, CardState> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  
  constructor(props: any) {
    super(props);
    this.state = {}
  }

  private cardName(): string {
    if (this.props.faceUp) {
      return `${this.suitName()}_${this.cardFace()}`
    }
    return "alternate-back";
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
  
  componentDidMount() {
    interact(this.domElement.current!)
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          start: event => {
            this.props.onPickUp();
          },
          move: event => {
            var x = this.props.location[0] + event.dx
            var y = this.props.location[1] + event.dy
            this.props.onMove(x, y);
          },
          end: event => {            
            // alert((Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
            //     Math.pow(event.pageY - event.y0, 2) | 0))
            //   .toFixed(2));
            
            this.props.onDrop(event.pageX, event.pageY);
          }
        }
      });
  }

  private style(): React.CSSProperties {
    return {
      transition: 'all 0s ease 0s',
      transform: `translate(${this.props.location[0]}px, ${this.props.location[1]}px)`,
      zIndex: this.props.zIndex,
    }
  }

  render() {
    return (
      <div
        className="card"
        ref={this.domElement}
        style={this.style()}
        onDoubleClick={this.props.onClick}
      >
        <svg width="100%" viewBox="0 0 169.075 244.64">
          <use xlinkHref={`#${this.cardName()}`} />
        </svg>
      </div>
    );
  }
}
