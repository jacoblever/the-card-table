import { Card, CardState } from "./state";
import { ActionTypes, DROP_CARD, INITIAL_CARD_STATE, MOVE_CARD, PICK_UP_CARD, TURN_OVER_CARD } from "./actions";

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
    case PICK_UP_CARD:
    case MOVE_CARD:
    case DROP_CARD:
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
      }

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
      }
    case MOVE_CARD:
      return {
        ...state,
        location: action.location,
      };
    case DROP_CARD:
      return {
        ...state,
        heldBy: action.nowHeldBy,
        location: action.location,
        zIndex: maxZIndexGetter() + 1,
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
