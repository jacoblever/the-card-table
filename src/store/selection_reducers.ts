import { CardState } from "./state";
import { SelectCardsUnderAction } from "./actions";

export function SelectCardsUnderReducer(
  state: CardState,
  action: SelectCardsUnderAction,
): CardState {
  const cardWidth = 60;
  const cardHeight = 86;
  let cardClicked = state.cardsById[action.cardId];
  let allCards = Object.values(state.cardsById);
  let cardsToUnderThisOne = allCards
    .filter(x => x.heldBy === cardClicked.heldBy)
    .filter(x => x.zIndex <= cardClicked.zIndex)
    .filter(x => Math.abs(x.location[0] - cardClicked.location[0]) < cardWidth)
    .filter(x => Math.abs(x.location[1] - cardClicked.location[1]) < cardHeight)
    .sort((a, b) => b.zIndex - a.zIndex);

  // If we have already selected some cards we should select everything rather than
  // just the cards in the same faceUp state as the top one
  let selectAll = cardClicked.selected;

  let newState: CardState = {...state};
  for(let i = 0; i < cardsToUnderThisOne.length; i++) {
    let card = cardsToUnderThisOne[i];
    if(!selectAll && card.faceUp !== cardClicked.faceUp) {
      break;
    }

    newState.cardsById[card.id] = {...card, selected: true};
  }
  return newState;
}

export function DeselectAllCardsReducer(
  state: CardState,
): CardState {

  let newState: CardState = {...state};
  Object.values(state.cardsById)
    .forEach(card => {
      if(card.selected) {
        newState.cardsById[card.id] = {...card, selected: false};
      }
    });
  return newState;
}
