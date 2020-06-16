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
      selectionActive: false,
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
      let pickUpChanges: { [key: string]: Card; } = {};
      let maxZIndexGetter = () => {
        let cards = Object.keys(state.cardsById)
          .map(id => state.cardsById[id])
          .filter(c => !action.pickUps.map(x => x.cardId).includes(c.id));
        if (cards.length === 0) {
          return 0;
        }
        return Math.max(
          ...cards.map(c => c.zIndex),
        );
      };
      let currentMaxZIndex = maxZIndexGetter();
      action.pickUps
        .map(pickUp => {
          return {
            card: state.cardsById[pickUp.cardId],
            pickUp: pickUp,
          };
        })
        .sort((a, b) => {
          return a.card.zIndex - b.card.zIndex;
        })
        .forEach((x, i) => {
          pickUpChanges[x.card.id] = {
            ...x.card,
            zIndex: currentMaxZIndex + 1 + i,
            forceFaceDown: x.pickUp.ensureIdentityStaysHidden,
          }
        });
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          ...pickUpChanges,
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
      action.drops.forEach(drop => {
        let card = state.cardsById[drop.cardId];
        dropChanges[drop.cardId] = {
          ...card,
          location: drop.location,
          zIndex: drop.zIndex,
          heldBy: action.nowHeldBy,
          forceFaceDown: false,
          faceUp: drop.turnOver ? !card.faceUp : card.faceUp,
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
