import { DatabaseCard } from "./database";

export interface BackendCard {
  id: string;
  faceUp: boolean;
  suit: 0 | 1 | 2 | 3;
  number: number;
  heldBy: null;
  location: [number, number];
  zIndex: number;
}

export const databaseToBackendCard = (card: DatabaseCard) => {
  return {
    id: card.cardId,
    faceUp: card.faceUp,
    suit: card.suit,
    number: card.number,
    heldBy: card.heldBy,
    location: card.location,
    zIndex: card.zIndex,
  } as BackendCard;
}

export interface BackendCardState {
  cardsById: { [key: string]: BackendCard; };
  players: string[];
  me: string;
}
