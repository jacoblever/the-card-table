import { Suit } from '../Suit';

export interface AppState {
  room: RoomState;
  roomId: string | null;
}

export interface RoomState {
  connection: ConnectionState;
  me: string;
  cardsById: { [key: string]: Card; };
  players: Player[];
  dealModal: DealModalState;
}

export interface ConnectionState {
  webSocketDisconnected: boolean;
}

export interface DealModalState {
  show: boolean;
  defaultDealNumber: number;
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
  selected: boolean;
  isMoving: boolean;
}

export type CardOwner = string | typeof CardOwnerTable
export const CardOwnerTable = null;

export type Coordinates = [number, number];
