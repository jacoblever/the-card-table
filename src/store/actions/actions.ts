import { AppState } from "../state";
import { Action } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { WebsocketActions, WsConnectAction, WsDisconnectAction, WsDisconnectedAction } from "./websocket_actions";
import {
  CardActions,
  CloseDealModalAction,
  DeselectAllCardsAction,
  DropCardsAction,
  InitialCardStateAction,
  MoveCardsAction,
  OpenDealModalAction,
  PickUpCardsAction,
  SelectCardsUnderAction
} from "./card_actions";
import { KickPlayerAction, NameChangeAction, PlayerActions, PlayersUpdateAction } from "./player_actions";
import { ChangeRoomAction } from "./room_actions";

export interface RemoteAction<T> extends Action<T> {
    remote: boolean;
}

export type AppThunkAction<TReturnType, TActionParam> = ThunkAction<
  Promise<TReturnType>,
  AppState,
  TActionParam,
  AppAction>

export type AppThunkDispatch = ThunkDispatch<AppState, any, AppAction>;

export type AppAction = CardActions
  | ChangeRoomAction
  | PlayerActions
  | WebsocketActions;
