import React from 'react';

import interact from 'interactjs'
import '@interactjs/types'

import './OtherPlayerHandComponent.css';
import { Card } from "./store/state";
import { CardContainer } from "./CardContainer";

type Props = {
  playerId: string,
  cards: Card[],
}

export class OtherPlayerHandComponent extends React.Component<Props, {}> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    interact(this.domElement.current!)
      .dropzone({
        accept: '.card',
        overlap: 0.1,
        // When a card is picked up (wherever it is)
        ondropactivate: function (event) {
          let handDomElement = event.target;

          handDomElement.classList.add('drop-active');
        },
        // When a card is dragged over the hand
        ondragenter: function (event) {
          let handDomElement = event.target;
          let cardDomElement = event.relatedTarget;

          handDomElement.classList.add('drop-target')
          cardDomElement.classList.add('can-drop')
        },
        // When a card is dragged out of the hand
        ondragleave: function (event) {
          let handDomElement = event.target;
          let cardDomElement = event.relatedTarget;

          handDomElement.classList.remove('drop-target')
          cardDomElement.classList.remove('can-drop')
        },
        // When a card is dropped in the hand
        ondrop: function (event) {

        },
        // When a card is dropped (wherever it is)
        ondropdeactivate: function (event) {
          let handDomElement = event.target;

          handDomElement.classList.remove('drop-active')
          handDomElement.classList.remove('drop-target')
        }
      });
  }

  render() {
    return (
      <div id={this.props.playerId} className="other-player-hand" ref={this.domElement}>
        {this.props.cards.map(card =>
          <CardContainer
            id={card.id}
            key={card.id}
            faceUp={false}
            suit={card.suit}
            number={card.number}
            zIndex={card.zIndex}
            movable={false}
          />
        )}
      </div>
    );
  }
}