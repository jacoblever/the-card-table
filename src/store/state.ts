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
