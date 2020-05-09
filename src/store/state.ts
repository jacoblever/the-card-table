import { Suit } from '../Suit';

export interface AppState {
  cards: CardState;
}

export interface CardState {
  cardsById: { [key: string]: Card; };
}

export interface Card {
  id: string;
  faceUp: boolean;
  suit: Suit;
  number: number;
  location: number[];
  zIndex: number;
}

export function getInitialCardState() {
  let cards: Card[] = []
  let suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades]
  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.push({
        id: `${suit}-${i}`,
        faceUp: false,
        suit: suit,
        number: i,
        location: [30, 30],
        zIndex: 0,
      });
    }
  }
  cards.sort(() => Math.random() - 0.5);
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.zIndex = i;
  }
  let cardState: CardState = {
    cardsById: {},
  }
  for (const card of cards) {
    cardState.cardsById[card.id] = card;
  }
  return cardState;
}
