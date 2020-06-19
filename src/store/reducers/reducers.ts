import { ConnectionState, DealModalState } from "../state";
import { AppAction } from "../actions/actions";
import { combineReducers } from "redux";
import { CardsReducer } from "./cards_reducer";
import { PlayersReducer } from "./players_reducer";
import { WS_DISCONNECTED } from "../actions/websocket_actions";
import { CLOSE_DEAL_MODAL, INITIAL_CARD_STATE, OPEN_DEAL_MODAL, SET_DEFAULT_DEAL_NUMBER } from "../actions/card_actions";
import { RoomIdReducer } from "./room_id_reducer";

export function MeReducer(
  state: string = "",
  action: AppAction,
): string {
  switch (action.type) {
    case INITIAL_CARD_STATE:
      return action.state.me;
    default:
      return state;
  }
}

export function ConnectionReducer(
  state: ConnectionState = {webSocketDisconnected: false},
  action: AppAction,
): ConnectionState {
  switch (action.type) {
    case WS_DISCONNECTED:
      return {
        ...state,
        webSocketDisconnected: true,
      }
    default:
      return state;
  }
}

export function DealModalReducer(
  state: DealModalState = {show: false, defaultDealNumber: 7},
  action: AppAction,
): DealModalState {
  switch (action.type) {
    case OPEN_DEAL_MODAL:
      return {
        ...state,
        show: true,
      };
    case CLOSE_DEAL_MODAL:
      return {
        ...state,
        show: false,
      };
    case SET_DEFAULT_DEAL_NUMBER:
      return {
        ...state,
        defaultDealNumber: action.defaultDealNumber,
      }
    default:
      return state;
  }
}

export const RoomReducer = combineReducers({
  connection: ConnectionReducer,
  cardsById: CardsReducer,
  players: PlayersReducer,
  me: MeReducer,
  dealModal: DealModalReducer,
});

export const rootReducer = combineReducers({
  room: RoomReducer,
  roomId: RoomIdReducer,
});
