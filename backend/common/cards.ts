import { DatabaseCard } from "./database";

export type BackendCard = {
  id: string;
  faceUp: boolean;
  suit: 0 | 1 | 2 | 3;
  number: number;
  heldBy: null;
  location: [number, number];
  zIndex: number;
}

export const databaseToBackendCard = (card: DatabaseCard) => {
  let backendCard: BackendCard = {
    id: card.cardId,
    faceUp: card.flipCount % 2 === 1,
    suit: card.suit,
    number: card.number,
    heldBy: card.heldBy,
    location: card.location,
    zIndex: card.zIndex,
  };
  return backendCard;
}

export interface BackendCardState {
  cardsById: { [key: string]: BackendCard; };
  players: string[];
  me: string;
}
