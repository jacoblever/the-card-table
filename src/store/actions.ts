import { AppState, Card, CardOwner, CardState, Coordinates, Player } from "./state";
import { Action, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { Elementwise } from "../geometry/elementwise";
import { LocationTransformer } from "../geometry/locationTransformer";
import { animateDropCard } from "../server/animations";

export const PICK_UP_CARD = "PICK_UP_CARD";
export const MOVE_CARD = "MOVE_CARD";
export const DROP_CARD = "DROP_CARD";
export const CHANGE_ROOM = "CHANGE_ROOM";
export const WS_CONNECT = "WS_CONNECT";
export const WS_DISCONNECT = "WS_DISCONNECT";
export const INITIAL_CARD_STATE = "INITIAL_CARD_STATE";
export const PLAYERS_UPDATE = "PLAYERS_UPDATE";
export const NAME_CHANGE = "NAME_CHANGE";
export const KICK_PLAYER = "KICK_PLAYER";
export const SELECT_CARDS_UNDER = "SELECT_CARDS_UNDER";
export const DESELECT_ALL_CARDS = "DESELECT_ALL_CARDS";

interface RemoteAction<T> extends Action<T> {
    remote: boolean;
}

export interface PickUpCardAction extends RemoteAction<typeof PICK_UP_CARD> {
  pickUps: {
    cardId: string;
    ensureIdentityStaysHidden: boolean;
  }[];
}

export interface MoveCardAction extends Action<typeof MOVE_CARD> {
  moves: {
    cardId: string;
    location: Coordinates;
  }[];
}

export interface DropCardAction extends RemoteAction<typeof DROP_CARD> {
  nowHeldBy: CardOwner;
  drops: {
    cardId: string;
    location: Coordinates;
    zIndex: number;
    turnOver: boolean,
  }[];
}

export interface ChangeRoomAction extends Action<typeof CHANGE_ROOM> {
    roomId: string | null;
}

export interface WsConnectAction extends Action<typeof WS_CONNECT> {
    type: typeof WS_CONNECT;
}

export interface WsDisconnectAction extends Action<typeof WS_DISCONNECT> {
    type: typeof WS_DISCONNECT;
}

export interface InitialCardStateAction extends Action<typeof INITIAL_CARD_STATE> {
  state: CardState;
}

export interface PlayersUpdateAction extends Action<typeof PLAYERS_UPDATE> {
  players: Player[];
}

export interface NameChangeAction extends RemoteAction<typeof NAME_CHANGE> {
  playerId: string;
  name: string;
}

export interface KickPlayerAction extends RemoteAction<typeof KICK_PLAYER> {
  playerId: string;
}

export interface SelectCardsUnderAction extends Action<typeof SELECT_CARDS_UNDER> {
  cardId: string;
}

export interface DeselectAllCardsAction extends Action<typeof DESELECT_ALL_CARDS> {
}


export type AppThunkAction<TReturnType, TActionParam> = ThunkAction<
  Promise<TReturnType>,
  AppState,
  TActionParam,
  ActionTypes>

export type AppThunkDispatch = ThunkDispatch<AppState, any, ActionTypes>;

export type ActionTypes = PickUpCardAction
  | MoveCardAction
  | DropCardAction
  | ChangeRoomAction
  | WsConnectAction
  | WsDisconnectAction
  | InitialCardStateAction
  | PlayersUpdateAction
  | NameChangeAction
  | KickPlayerAction
  | SelectCardsUnderAction
  | DeselectAllCardsAction;

export type GrabCardParams = {
  cardId: string,
}

export function grabCard(params: GrabCardParams): AppThunkAction<void, GrabCardParams> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToPickUp = getCardsGroup(getState().cards.cardsById, params.cardId);

    let pickUps = cardsToPickUp.map(card => {
      return {
        cardId: card.id,
      };
    });
    dispatch(pickUpCard(pickUps));
    return Promise.resolve();
  };
}

export function pickUpCard(pickUps: {cardId: string, ensureIdentityStaysHidden?: boolean}[]): PickUpCardAction {
  return {
    type: PICK_UP_CARD,
    remote: false,
    pickUps: pickUps.map(x => {
      return {
        cardId: x.cardId,
        ensureIdentityStaysHidden: x.ensureIdentityStaysHidden ?? false,
      }
    }),
  };
}

export type DragCardParams = {
  cardId: string,
  delta: Coordinates,
}

export function dragCard(params: DragCardParams): AppThunkAction<void, DropCardAction> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToMove = getCardsGroup(getState().cards.cardsById, params.cardId);

    let moves = cardsToMove.map(card => {
      return {
        cardId: card.id,
        location: Elementwise.map(i => card.location[i] + params.delta[i]),
      };
    });
    dispatch(moveCard(moves));
    return Promise.resolve();
  };
}

function getCardsGroup(cardsById: { [key: string]: Card; }, cardId: string | null = null): Card[] {
  let selectedCards = Object.keys(cardsById)
    .map(id => cardsById[id])
    .filter(x => x.selected);
  if (cardId && !selectedCards.map(x => x.id).includes(cardId)) {
    return [cardsById[cardId]];
  }
  return selectedCards;
}

export function moveCard(moves: {cardId: string, location: Coordinates}[]): MoveCardAction {
  return {
    type: MOVE_CARD,
    moves: moves,
  };
}

export type ReleaseCardParams = {
  cardId: string,
  nowHeldBy: CardOwner,
}

export function releaseCard(params: ReleaseCardParams): AppThunkAction<void, ReleaseCardParams> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToDrop = getCardsGroup(getState().cards.cardsById, params.cardId);
    dispatch(dropCard(
      params.nowHeldBy,
      cardsToDrop.map(card => {
        let transformedLocation = new LocationTransformer(card.location, card.heldBy)
          .transformTo(params.nowHeldBy);
        return {
          cardId: card.id,
          location: transformedLocation,
          zIndex: card.zIndex,
        };
      }),
    ));
    return Promise.resolve();
  };
}

export type FlipCardParams = {
  cardId: string,
}

export function flipCard(params: FlipCardParams): AppThunkAction<void, FlipCardParams> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToFlip = getCardsGroup(getState().cards.cardsById, params.cardId);
    cardsToFlip.sort((a, b) => a.zIndex - b.zIndex);

    dispatch(dropCard(
      cardsToFlip[0].heldBy,
      cardsToFlip.map((card, i) => {
        return {
          cardId: card.id,
          location: card.location,
          zIndex: cardsToFlip[cardsToFlip.length - 1 - i].zIndex,
          turnOver: true,
        };
      }),
    ));
    return Promise.resolve();
  };
}

export function dropCard(nowHeldBy: CardOwner, drops: {cardId: string, location: Coordinates, zIndex: number, turnOver?: boolean}[], remote: boolean = false): DropCardAction {
  return {
    type: DROP_CARD,
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

export function changeRoom(roomId: string | null): ChangeRoomAction {
  return {
    type: CHANGE_ROOM,
    roomId: roomId,
  };
}

export function wsConnect(): WsConnectAction {
  return {
    type: WS_CONNECT,
  };
}

export function wsDisconnect(): WsDisconnectAction {
  return {
    type: WS_DISCONNECT,
  };
}

export function nameChange(playerId: string, name: string): NameChangeAction {
  return {
    type: NAME_CHANGE,
    remote: false,
    playerId: playerId,
    name: name,
  };
}

export function kickPlayer(playerId: string): KickPlayerAction {
  return {
    type: KICK_PLAYER,
    playerId: playerId,
    remote: false,
  };
}

export function selectCardsUnder(cardId: string): SelectCardsUnderAction {
  return {
    type: SELECT_CARDS_UNDER,
    cardId: cardId,
  };
}

export function deselectAllCards(): DeselectAllCardsAction {
  return {
    type: DESELECT_ALL_CARDS,
  };
}

export function shuffleSelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().cards.cardsById);
    let newLocation = meanLocation(cards);
    let zIndexes = cards.map(x => x.zIndex)
      .sort(x => Math.random() - 0.5);

    await dispatch(animateDropCard(dropCard(
      cards[0].heldBy,
      cards.map((x, i) => {
        return {
          cardId: x.id,
          location: newLocation,
          zIndex: zIndexes[i],
        };
      }),
    )));
  }
}

function meanLocation(cards: Card[]) {
  return Elementwise.map(i => {
    let sum = cards.map(x => x.location[i]).reduce((a, x) => a + x);
    return Math.round(sum / cards.length);
  });
}

export function tidySelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().cards.cardsById);
    let newLocation = meanLocation(cards);
    await dispatch(animateDropCard(dropCard(
      cards[0].heldBy,
      cards.map(x => {
        return {
          cardId: x.id,
          location: newLocation,
          zIndex: x.zIndex,
        };
      }),
    )));
  }
}
