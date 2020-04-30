import {
  CardState,
  Card,
  PICK_UP_CARD,
  MOVE_CARD,
  DROP_CARD,
  TURN_OVER_CARD,
  ActionTypes
} from "./types";
import { Suit } from '../Suit';

let uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // eslint-disable-next-line
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
};

let getInitalCards: () => CardState = () => {
  let cards: Card[] = []
  let suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades]
  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      cards.push({
        faceUp: false,
        suit: suit,
        number: i,
        location: [30, 30],
        zIndex: 0,
      });
    }
  }
  cards.sort(() => Math.random() - 0.5);
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    card.zIndex = i;
  }
  let cardState: CardState = {
    cardsById: {},
  }
  for (const card of cards) {
    cardState.cardsById[uuidv4()] = card;
  }
  return cardState;
};

export function CardsReducer(
  state: CardState,
  action: ActionTypes,
): CardState {
  if (state === undefined) {
    state = getInitalCards();
  }
  
  switch (action.type) {
    case PICK_UP_CARD:
      let zIndexOfHighestOtherCard = Math.max(
        ...Object.keys(state.cardsById)
          .filter(id => id !== action.cardId)
          .map(id => state.cardsById[id].zIndex)
      );
      return {
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
            {},
            state.cardsById[action.cardId],
            { zIndex: zIndexOfHighestOtherCard + 1 }
          ),
        }
      }

    case MOVE_CARD:
      return {
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
            {},
            state.cardsById[action.cardId],
            { location: action.location }
          ),
        }
      }
    case DROP_CARD:
      return state
    case TURN_OVER_CARD:
      return {
        cardsById: {
          ...state.cardsById,
          [action.cardId]: Object.assign(
            {},
            state.cardsById[action.cardId],
            { faceUp: !state.cardsById[action.cardId].faceUp }
          ),
        }
      }
    default:
      return state;
  }
}
