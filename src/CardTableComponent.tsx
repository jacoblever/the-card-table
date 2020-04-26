import React from 'react';

import interact from 'interactjs'
import '@interactjs/types'

import './CardTableComponent.css';
import CardComponent from './CardComponent';
import { Suit } from './Suit';

interface Locations {
  [key: string]: number[]
}

type CardTableState = {
  locations: Locations,
  deck: Deck,
}

class Deck {
  private _cards: Card[];

  constructor() {
    this._cards = this.generateDeck();
  }

  public moveToTop(cardId: string): void {
    let card = this._cards.find(x => x.id === cardId);
    if (card) {
      card.zIndex = Math.max(...this._cards.map(x => x.zIndex)) + 1;
    }
  }

  public render(): React.ReactNode {
    return this._cards.map(x => x.element);
  }

  private generateDeck(): Card[] {
    let cards: Card[] = []
    let suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades]
    for (let suit of suits) {
      for (let i = 1; i <= 13; i++) {
        cards.push(new Card(suit, i));
      }
    }
    cards.sort(() => Math.random() - 0.5);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.zIndex = i;
    }
    return cards;
  }
}

class Card {
  private _id: string;
  private _faceUp: boolean;
  private _suit: Suit;
  private _number: number;
  private _zIndex: number = 0;

  constructor(suit: Suit, number: number) {
    this._id = `${suit}-${number}`;
    this._faceUp = true;
    this._suit = suit;
    this._number = number;
  }

  public get id(): string {
    return this._id;
  }

  public get zIndex(): number {
    return this._zIndex;
  }

  public set zIndex(value: number) {
    this._zIndex = value;
  }

  public get element(): JSX.Element {
    return (
      <CardComponent
        id={this._id}
        faceUp={this._faceUp}
        suit={this._suit}
        number={this._number}
        zIndex={this._zIndex}
      />
    )
  }
}

class CardTableComponent extends React.Component<{}, CardTableState> {
  constructor(props: any) {
    super(props);
    this.state = {
      locations: {},
      deck: new Deck(),
    }

    this.showCurrentLocations = this.showCurrentLocations.bind(this);
  }

  componentDidMount() {
    interact('.card')
      .draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ],
        autoScroll: true,
        listeners: {
          start: event => {
            var card = event.target;
            var cardId = card.id;
            this.state.deck.moveToTop(cardId);
          },
          move: event => {
            var card = event.target;
            var x = (parseFloat(card.getAttribute('data-x')) || 0) + event.dx
            var y = (parseFloat(card.getAttribute('data-y')) || 0) + event.dy

            card.style.transition = 'all 0s';
            card.style.webkitTransform =
              card.style.transform =
              'translate(' + x + 'px, ' + y + 'px)'
            
            let locations = this.state.locations;
            locations[card.id] = [x, y];
            this.setState({ locations: locations });
            card.setAttribute('data-x', x)
            card.setAttribute('data-y', y)
          },
          end: event => {            
            // alert((Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
            //     Math.pow(event.pageY - event.y0, 2) | 0))
            //     .toFixed(2));
          }
        }
      });
  }

  setCardLocations(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    let locations = JSON.parse(prompt("Enter location JSON") || '{}');
    console.log(locations);
    for (var cardId in locations) {
      if (locations.hasOwnProperty(cardId)) {
        console.log(cardId);
        let location = locations[cardId];
        let cardEl = document.getElementById(cardId);
        if (cardEl) {
          cardEl.style.transition = 'all 0.2s';
          cardEl.style.webkitTransform =
            cardEl.style.transform =
            'translate(' + location[0] + 'px, ' + location[1] + 'px)';
          cardEl.setAttribute('data-x', location[0]);
          cardEl.setAttribute('data-y', location[1]);
        }
      }
    }
  }

  showCurrentLocations(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    alert(JSON.stringify(this.state.locations));
  }
   
  render() {
    return (
      <div className="table">        
        <button onClick={this.showCurrentLocations}>Show Current Locations</button>
        <button onClick={this.setCardLocations}>Set Locations</button>
        {this.state.deck.render()}
      </div>
    );
  }
}

export default CardTableComponent;
