import { CardState, getInitialCardState } from "./state";
import { ActionTypes, DROP_CARD, MOVE_CARD, PICK_UP_CARD, TURN_OVER_CARD } from "./actions";

export function CardsReducer(
  state: CardState,
  action: ActionTypes,
): CardState {
  if (state === undefined) {
    state = getInitialCardState();
  }
  
  switch (action.type) {
    case PICK_UP_CARD:
      let zIndexOfHighestOtherCard = Math.max(
        ...Object.keys(state.cardsById)
          .filter(id => id !== action.cardId)
          .map(id => state.cardsById[id].zIndex)
      );
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
            {},
            state.cardsById[action.cardId],
            { zIndex: zIndexOfHighestOtherCard + 1 }
          ),
        }
      };
    case MOVE_CARD:
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [action.cardId]: {
            ...state.cardsById[action.cardId],
            location: action.location,
          },
        }
      };
    case DROP_CARD:
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
              {},
              state.cardsById[action.cardId],
              { nowHeld: action.location }
          ),
          [action.cardId]: {
            ...state.cardsById[action.cardId],
            heldBy: action.nowHeldBy,
            location: action.location,
          },
        }
      };
    case TURN_OVER_CARD:
      return {
        ...state,
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
            {},
            state.cardsById[action.cardId],
            { faceUp: !state.cardsById[action.cardId].faceUp }
          ),
        }
      };
    default:
      return state;
  }
}
