import { CardOwner, Coordinates, RoomState } from "../state";
import { Action } from "redux";
import { RemoteAction } from "./actions";

export const PICK_UP_CARDS = "PICK_UP_CARDS";
export interface PickUpCardsAction extends RemoteAction<typeof PICK_UP_CARDS> {
  pickUps: {
    cardId: string;
    ensureIdentityStaysHidden: boolean;
  }[];
}

export function pickUpCards(pickUps: { cardId: string, ensureIdentityStaysHidden?: boolean }[]): PickUpCardsAction {
  return {
    type: PICK_UP_CARDS,
    remote: false,
    pickUps: pickUps.map(x => {
      return {
        cardId: x.cardId,
        ensureIdentityStaysHidden: x.ensureIdentityStaysHidden ?? false,
      }
    }),
  };
}

export const MOVE_CARDS = "MOVE_CARDS";
export interface MoveCardsAction extends Action<typeof MOVE_CARDS> {
  moves: {
    cardId: string;
    location: Coordinates;
  }[];
}

export function moveCards(moves: { cardId: string, location: Coordinates }[]): MoveCardsAction {
  return {
    type: MOVE_CARDS,
    moves: moves,
  };
}

export const DROP_CARDS = "DROP_CARDS";
export interface DropCardsAction extends RemoteAction<typeof DROP_CARDS> {
  nowHeldBy: CardOwner;
  drops: {
    cardId: string;
    location: Coordinates;
    zIndex: number;
    turnOver: boolean,
  }[];
}

export function dropCards(nowHeldBy: CardOwner, drops: { cardId: string, location: Coordinates, zIndex: number, turnOver?: boolean }[], remote: boolean = false): DropCardsAction {
  return {
    type: DROP_CARDS,
    remote: remote,
    nowHeldBy: nowHeldBy,
    drops: drops.map(x => {
      return {
        cardId: x.cardId,
        location: x.location,
        zIndex: x.zIndex,
        turnOver: x.turnOver ?? false,
      }
    }),
  };
}

export const INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export interface InitialCardStateAction extends Action<typeof INITIAL_CARD_STATE> {
  state: RoomState;
}

export const SELECT_CARDS_UNDER = "SELECT_CARDS_UNDER";
export interface SelectCardsUnderAction extends Action<typeof SELECT_CARDS_UNDER> {
  cardId: string;
}

export function selectCardsUnder(cardId: string): SelectCardsUnderAction {
  return {
    type: SELECT_CARDS_UNDER,
    cardId: cardId,
  };
}

export const DESELECT_ALL_CARDS = "DESELECT_ALL_CARDS";
export interface DeselectAllCardsAction extends Action<typeof DESELECT_ALL_CARDS> {
}

export function deselectAllCards(): DeselectAllCardsAction {
  return {
    type: DESELECT_ALL_CARDS,
  };
}

export const OPEN_DEAL_MODAL = "OPEN_DEAL_MODAL";
export interface OpenDealModalAction extends Action<typeof OPEN_DEAL_MODAL> {
}

export function openDealModal(): OpenDealModalAction {
  return {
    type: OPEN_DEAL_MODAL,
  };
}

export const CLOSE_DEAL_MODAL = "CLOSE_DEAL_MODAL";
export interface CloseDealModalAction extends Action<typeof CLOSE_DEAL_MODAL> {
}

export function closeDealModal(): CloseDealModalAction {
  return {
    type: CLOSE_DEAL_MODAL,
  };
}

export type CardActions = PickUpCardsAction
  | MoveCardsAction
  | DropCardsAction
  | InitialCardStateAction
  | SelectCardsUnderAction
  | DeselectAllCardsAction
  | OpenDealModalAction
  | CloseDealModalAction;

