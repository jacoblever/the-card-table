import { Suit } from '../Suit';

export interface AppState {
  cards: CardState;
  roomId: string | null;
}

export interface CardState {
  cardsById: { [key: string]: Card; };
  players: Player[];
  me: string;
}

export interface Player {
  id: string;
  name: string;
  online: boolean;
}

export interface Card {
  id: string;
  faceUp: boolean;
  suit: Suit;
  number: number;
  heldBy: CardOwner;
  location: Coordinates;
  zIndex: number;

  /** Not persisted on the backend */
  forceFaceDown: boolean;
}

export type CardOwner = string | typeof CardOwnerTable
export const CardOwnerTable = null;

export type Coordinates = [number, number];
