import React from 'react';

import interact from 'interactjs'
import '@interactjs/types'
import 'long-press-event/src/long-press-event'

import { Suit } from './Suit';
import './CardComponent.css';
import { CardOwner, CardOwnerTable, Coordinates } from "./store/state";
import { LocationTransformer } from "./geometry/locationTransformer";
import { Elementwise } from "./geometry/elementwise";

export type CardProps = {
  id: string,
  location: Coordinates,
  suit: Suit,
  number: number,
  heldBy: CardOwner,
  faceUp: boolean,
  zIndex: number,
  movable: boolean,
  selected: boolean,

  onTurnOver: () => void,
  onSelectUnder: () => void,
  onPickUp: () => void,
  onMove: (location: Coordinates) => void,
  onDrop: (location: Coordinates, zIndex: number, nowHeldBy: CardOwner) => void,
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
    if(!this.props.movable) {
      return;
    }
    this.domElement.current!.addEventListener('long-press', e => {
      this.props.onSelectUnder();
    })
    interact(this.domElement.current!)
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: '#card-table',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          start: event => {
            this.props.onPickUp();
          },
          move: event => {
            let delta = [event.dx, event.dy];
            let newLocation = Elementwise.map(i => this.props.location[i] + delta[i]);
            this.props.onMove(newLocation);
          },
          end: event => {
            let dropzone = event.dropzone?.target;
            let nowHeldBy = dropzone?.id ?? CardOwnerTable;
            let transformedLocation = new LocationTransformer(this.props.location, this.props.heldBy)
              .transformTo(nowHeldBy);
            this.props.onDrop(transformedLocation, this.props.zIndex, nowHeldBy);
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
        className={this.getClassNames()}
        ref={this.domElement}
        style={this.style()}
        onDoubleClick={(e) => this.onDoubleClick()}
      >
        <svg width="100%" viewBox="0 0 169.075 244.64">
          <use xlinkHref={`#${this.cardName()}`} />
        </svg>
      </div>
    );
  }

  private getClassNames() {
    let classNames = "card";
    if(this.props.selected){
      classNames += " selected";
    }
    return classNames;
  }

  private onDoubleClick() {
    if(!this.props.movable) {
      return;
    }
    return this.props.onTurnOver();
  }
}
