import { Card, CardState } from "./state";
import {
  ActionTypes,
  DESELECT_ALL_CARDS,
  DROP_CARD,
  INITIAL_CARD_STATE,
  CHANGE_ROOM,
  MOVE_CARD,
  NAME_CHANGE,
  PICK_UP_CARD,
  PLAYERS_UPDATE,
  SELECT_CARDS_UNDER,
  TURN_OVER_CARD
} from "./actions";
import { DeselectAllCardsReducer, SelectCardsUnderReducer } from "./selection_reducers";

export function getRoomIdFromUrl(): string | null {
  if(window.location.pathname === '/') {
    return null;
  }
  return window.location.pathname.split('/').slice(1).join('/');
}

export function RoomIdReducer(
  state: string,
  action: ActionTypes,
): string | null {
  if (state === undefined) {
    return getRoomIdFromUrl()
  }

  if(action.type === CHANGE_ROOM) {
    return action.roomId;
  }
  return state;
}

export function CardsReducer(
  state: CardState,
  action: ActionTypes,
): CardState {
  if (state === undefined) {
    state = {
      cardsById: {},
      players: [],
      me: "a",
    };
  }

  switch (action.type) {
    case INITIAL_CARD_STATE:
      return action.state;
    case PLAYERS_UPDATE:
      return {
        ...state,
        players: action.players,
      };
    case NAME_CHANGE:
      let players = [...state.players];
      let player = players.filter(x => x.id === action.playerId)[0];
      player.name = action.name;
      return {
        ...state,
        players: players,
      };
    case SELECT_CARDS_UNDER:
      return SelectCardsUnderReducer(state, action);
    case DESELECT_ALL_CARDS:
      return DeselectAllCardsReducer(state);
    case PICK_UP_CARD:
    case TURN_OVER_CARD:
      let maxZIndexGetter = () => {
        let cards = Object.keys(state.cardsById)
          .map(id => state.cardsById[id])
          .filter(c => c.id !== action.cardId);
        if (cards.length === 0) {
          return 0;
        }
        return Math.max(
          ...cards.map(c => c.zIndex),
        );
      };
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [action.cardId]: CardReducer(
            state.cardsById[action.cardId],
            action,
            maxZIndexGetter,
          ),
        }
      };
    case MOVE_CARD:
      let moveChanges: { [key: string]: Card; } = {};
      action.moves.forEach(move => {
        moveChanges[move.cardId] = {
          ...state.cardsById[move.cardId],
          location: move.location,
        }
      });
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          ...moveChanges,
        }
      };
    case DROP_CARD:
      let dropChanges: { [key: string]: Card; } = {};
      action.drops.forEach(drops => {
        dropChanges[drops.cardId] = {
          ...state.cardsById[drops.cardId],
          location: drops.location,
          zIndex: drops.zIndex,
          heldBy: action.nowHeldBy,
          forceFaceDown: false,
        }
      });
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          ...dropChanges,
        }
      };
    default:
      return state;
  }
}

function CardReducer(
  state: Card,
  action: ActionTypes,
  maxZIndexGetter: () => number
): Card {
  switch (action.type) {
    case PICK_UP_CARD:
      return {
        ...state,
        zIndex: maxZIndexGetter() + 1,
        forceFaceDown: action.ensureIdentityStaysHidden,
      };
    case TURN_OVER_CARD:
      return {
        ...state,
        faceUp: !state.faceUp,
      };
    default:
      return state;
  }
}
