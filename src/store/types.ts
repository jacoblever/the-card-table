import { Suit } from '../Suit';

export interface Card {
  id: string;
  faceUp: boolean;
  suit: Suit;
  number: number;
  location: number[];
  zIndex: number;
}

export interface CardState {
  cardsById: { [key: string]: Card; };
}

export interface AppState {
  cards: CardState;
}

export const PICK_UP_CARD = "PICK_UP_CARD";
export const MOVE_CARD = "MOVE_CARD";
export const DROP_CARD = "DROP_CARD";
export const TURN_OVER_CARD = "TURN_OVER_CARD";
export const WS_CONNECT = "WS_CONNECT";
export const WS_DISCONNECT = "WS_DISCONNECT";

export interface PickUpCardAction {
  type: typeof PICK_UP_CARD;
  remote: boolean;
  cardId: string;
}

export interface MoveCardAction {
  type: typeof MOVE_CARD;
  remote: boolean;
  cardId: string;
  location: number[];
}

export interface DropCardAction {
  type: typeof DROP_CARD;
  remote: boolean;
  cardId: string;
  location: number[];
}

export interface TurnOverCardAction {
  type: typeof TURN_OVER_CARD;
  remote: boolean;
  cardId: string;
}

export interface WsConnectAction {
  type: typeof WS_CONNECT;
}

export interface WsDisconnectAction {
  type: typeof WS_DISCONNECT;
}

export type ActionTypes = PickUpCardAction
  | MoveCardAction
  | DropCardAction
  | TurnOverCardAction
  | WsConnectAction
  | WsDisconnectAction;
