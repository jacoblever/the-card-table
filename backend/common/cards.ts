export interface BackendCard {
  id: string;
  faceUp: boolean;
  suit: 0 | 1 | 2 | 3;
  number: number;
  heldBy: null;
  location: [number, number];
  zIndex: number;
}

export interface BackendCardState {
  cardsById: { [key: string]: BackendCard; };
  players: string[];
  me: string;
}
