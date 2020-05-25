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
  location: Coordinates;
  zIndex: number;
}

export type CardOwner = string | typeof CardOwnerTable
export const CardOwnerTable = null;

export type Coordinates = [number, number];

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
