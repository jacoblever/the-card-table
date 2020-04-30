import { PICK_UP_CARD, MOVE_CARD, DROP_CARD, TURN_OVER_CARD, ActionTypes } from "./types";

export function pickUpCard(cardId: string): ActionTypes {
  return {
    type: PICK_UP_CARD,
    cardId: cardId,
  };
}

export function moveCard(cardId: string, location: number[]): ActionTypes {
  return {
    type: MOVE_CARD,
    cardId: cardId,
    location: location,
  };
}

export function dropCard(cardId: string, location: number[]): ActionTypes {
  return {
    type: DROP_CARD,
    cardId: cardId,
    location: location,
  };
}

export function turnOverCard(cardId: string): ActionTypes {
  return {
    type: TURN_OVER_CARD,
    cardId: cardId,
  };
}
