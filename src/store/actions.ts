import { PICK_UP_CARD, MOVE_CARD, DROP_CARD, TURN_OVER_CARD, WS_CONNECT, WS_DISCONNECT, ActionTypes } from "./types";

export function pickUpCard(cardId: string): ActionTypes {
  return {
    type: PICK_UP_CARD,
    remote: false,
    cardId: cardId,
  };
}

export function moveCard(cardId: string, location: number[]): ActionTypes {
  return {
    type: MOVE_CARD,
    remote: false,
    cardId: cardId,
    location: location,
  };
}

export function dropCard(cardId: string, location: number[]): ActionTypes {
  return {
    type: DROP_CARD,
    remote: false,
    cardId: cardId,
    location: location,
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
