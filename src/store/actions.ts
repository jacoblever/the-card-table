import { CardOwner, Coordinates } from "./state";

export const PICK_UP_CARD = "PICK_UP_CARD";
export const MOVE_CARD = "MOVE_CARD";
export const DROP_CARD = "DROP_CARD";
export const TURN_OVER_CARD = "TURN_OVER_CARD";
export const WS_CONNECT = "WS_CONNECT";
export const WS_DISCONNECT = "WS_DISCONNECT";

interface RemoteAction {
    remote: boolean;
}

export interface PickUpCardAction extends RemoteAction {
    type: typeof PICK_UP_CARD;
    cardId: string;
}

export interface MoveCardAction extends RemoteAction {
    type: typeof MOVE_CARD;
    cardId: string;
    location: Coordinates;
}

export interface DropCardAction extends RemoteAction {
    type: typeof DROP_CARD;
    cardId: string;
    location: Coordinates;
    nowHeldBy: CardOwner;
}

export interface TurnOverCardAction extends RemoteAction {
    type: typeof TURN_OVER_CARD;
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

export function pickUpCard(cardId: string): ActionTypes {
  return {
    type: PICK_UP_CARD,
    remote: false,
    cardId: cardId,
  };
}

export function moveCard(cardId: string, location: Coordinates): ActionTypes {
  return {
    type: MOVE_CARD,
    remote: false,
    cardId: cardId,
    location: location,
  };
}

export function dropCard(cardId: string, location: Coordinates, nowHeldBy: CardOwner, remote: boolean = false): ActionTypes {
  return {
    type: DROP_CARD,
    remote: remote,
    cardId: cardId,
    location: location,
    nowHeldBy: nowHeldBy,
  };
}

export function turnOverCard(cardId: string, remote: boolean = false): ActionTypes {
  return {
    type: TURN_OVER_CARD,
    remote: remote,
    cardId: cardId,
  };
}

export function wsConnect(): ActionTypes {
  return {
    type: WS_CONNECT,
  };
}

export function wsDisconnect(): ActionTypes {
  return {
    type: WS_DISCONNECT,
  };
}
