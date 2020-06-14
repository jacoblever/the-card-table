import { AppState, Card, CardOwner, CardState, Coordinates, Player } from "./state";
import { Action, Dispatch } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { Elementwise } from "../geometry/elementwise";
import { LocationTransformer } from "../geometry/locationTransformer";

export const PICK_UP_CARD = "PICK_UP_CARD";
export const MOVE_CARD = "MOVE_CARD";
export const DROP_CARD = "DROP_CARD";
export const TURN_OVER_CARD = "TURN_OVER_CARD";
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
    cardId: string;
    ensureIdentityStaysHidden: boolean;
}

export interface MoveCardAction extends Action<typeof MOVE_CARD> {
    cardId: string;
    location: Coordinates;
}

export interface DropCardAction extends RemoteAction<typeof DROP_CARD> {
    cardId: string;
    location: Coordinates;
    zIndex: number;
    nowHeldBy: CardOwner;
}

export interface TurnOverCardAction extends RemoteAction<typeof TURN_OVER_CARD> {
    cardId: string;
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
  | TurnOverCardAction
  | ChangeRoomAction
  | WsConnectAction
  | WsDisconnectAction
  | InitialCardStateAction
  | PlayersUpdateAction
  | NameChangeAction
  | KickPlayerAction
  | SelectCardsUnderAction
  | DeselectAllCardsAction;

export function pickUpCard(cardId: string, ensureIdentityStaysHidden = false): PickUpCardAction {
  return {
    type: PICK_UP_CARD,
    remote: false,
    cardId: cardId,
    ensureIdentityStaysHidden: ensureIdentityStaysHidden,
  };
}

export type DragCardParams = {
  cardId: string,
  delta: Coordinates,
}

export function dragCard(params: DragCardParams): AppThunkAction<void, DropCardAction> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToMove = getCardsGroup(getState().cards.cardsById, params.cardId);
    cardsToMove.forEach(card => {
      dispatch(moveCard(
        card.id,
        Elementwise.map(i => card.location[i] + params.delta[i]),
      ))
    });
    return Promise.resolve();
  };
}

function getCardsGroup(cardsById: { [key: string]: Card; }, cardId: string): Card[] {
  let selectedCards = Object.keys(cardsById)
    .map(id => cardsById[id])
    .filter(x => x.selected);
  if (!selectedCards.map(x => x.id).includes(cardId)) {
    return [cardsById[cardId]];
  }
  return selectedCards;
}

export function moveCard(cardId: string, location: Coordinates): MoveCardAction {
  return {
    type: MOVE_CARD,
    cardId: cardId,
    location: location,
  };
}

export type ReleaseCardParams = {
  cardId: string,
  nowHeldBy: CardOwner,
}

export function releaseCard(params: ReleaseCardParams): AppThunkAction<void, ReleaseCardParams> {
  return async (dispatch: Dispatch<ActionTypes>, getState: () => AppState) => {
    let cardsToDrop = getCardsGroup(getState().cards.cardsById, params.cardId);
    cardsToDrop.forEach(card => {
      let transformedLocation = new LocationTransformer(card.location, card.heldBy)
        .transformTo(params.nowHeldBy);
      dispatch(dropCard(
        card.id,
        transformedLocation,
        card.zIndex,
        params.nowHeldBy,
      ));
    });
    return Promise.resolve();
  };
}

export function dropCard(cardId: string, location: Coordinates, zIndex: number, nowHeldBy: CardOwner, remote: boolean = false): DropCardAction {
  return {
    type: DROP_CARD,
    remote: remote,
    cardId: cardId,
    location: location,
    zIndex: zIndex,
    nowHeldBy: nowHeldBy,
  };
}

export function turnOverCard(cardId: string, remote: boolean = false): TurnOverCardAction {
  return {
    type: TURN_OVER_CARD,
    remote: remote,
    cardId: cardId,
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
