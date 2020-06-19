import { Card } from "../state";
import {
  AppAction
} from "../actions/actions";
import { DeselectAllCardsReducer, SelectCardsUnderReducer } from "./selection_reducers";
import {
  DESELECT_ALL_CARDS,
  DROP_CARDS,
  INITIAL_CARD_STATE,
  MOVE_CARDS, PICK_UP_CARDS,
  SELECT_CARDS_UNDER
} from "../actions/card_actions";

export function CardsReducer(
  state: { [key: string]: Card; } = {},
  action: AppAction,
): { [key: string]: Card; } {
  switch (action.type) {
    case INITIAL_CARD_STATE:
      return action.state.cardsById;
    case SELECT_CARDS_UNDER:
      return SelectCardsUnderReducer(state, action);
    case DESELECT_ALL_CARDS:
      return DeselectAllCardsReducer(state);
    case PICK_UP_CARDS:
      let pickUpChanges: { [key: string]: Card; } = {};
      let maxZIndexGetter = () => {
        let cards = Object.keys(state)
          .map(id => state[id])
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
            card: state[pickUp.cardId],
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
        ...pickUpChanges,
      };
    case MOVE_CARDS:
      let moveChanges: { [key: string]: Card; } = {};
      action.moves.forEach(move => {
        moveChanges[move.cardId] = {
          ...state[move.cardId],
          location: move.location,
        }
      });
      return {
        ...state,
        ...moveChanges,
      };
    case DROP_CARDS:
      let dropChanges: { [key: string]: Card; } = {};
      action.drops.forEach(drop => {
        let card = state[drop.cardId];
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
        ...dropChanges,
      };
    default:
      return state;
  }
}
