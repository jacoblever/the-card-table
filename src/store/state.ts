import { Suit } from '../Suit';

export interface AppState {
  cards: CardState;
}

export interface CardState {
  cardsById: { [key: string]: Card; };
  players: string[];
  me: string;
}

export interface Card {
  id: string;
  faceUp: boolean;
  suit: Suit;
  number: number;
  heldBy: CardOwner;
  location: number[];
  zIndex: number;
}

export type CardOwner = string | typeof CardOwnerTable
export const CardOwnerTable = null;

export type Location = {
  [index in 0 | 1]: number;
};

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
        heldBy: CardOwnerTable,
        location: [300, 150],
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
    players: ["a", "b", "c"],
    me: getMe(),
  }
  for (const card of cards) {
    cardState.cardsById[card.id] = card;
  }
  return cardState;
}

let getMe = () => {
  let name = "me";
  let url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  let results = regex.exec(url);
  if (!results) {
    return "a";
  }

  if (!results[2]) {
    return "a";
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
