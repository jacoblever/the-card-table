import { Card, CardState } from "./state";
import { SelectCardsUnderAction } from "./actions";
import { Elementwise } from "../geometry/elementwise"

export function SelectCardsUnderReducer(
  state: CardState,
  action: SelectCardsUnderAction,
): CardState {
  const cardWidth = 60;
  const cardHeight = 86;
  let cardClicked = state.cardsById[action.cardId];
  let allCards = Object.values(state.cardsById);
  let cardsWithSameOwner = allCards
    .filter(x => x.heldBy === cardClicked.heldBy);

  let cardsToSelect: Card[] = [];
  let selectedRegionTopLeft = cardClicked.location;
  let selectedRegionBottomRight = cardClicked.location;
  while (true) {
    let addedCount = 0;
    let cardsToCheck = cardsWithSameOwner.filter(x => !cardsToSelect.map(y => y.id).includes(x.id));
    for (let i = 0; i < cardsToCheck.length; i++) {
      let card = cardsToCheck[i];

      let isCloseToTopLeft = Math.abs(card.location[0] - selectedRegionTopLeft[0]) < cardWidth / 2
        && Math.abs(card.location[1] - selectedRegionTopLeft[1]) < cardHeight / 2;
      let isCloseToBottomRight = Math.abs(card.location[0] - selectedRegionBottomRight[0]) < cardWidth / 2
        && Math.abs(card.location[1] - selectedRegionBottomRight[1]) < cardHeight / 2;
      if (isCloseToTopLeft || isCloseToBottomRight) {
        addedCount++;
        cardsToSelect.push(card);
      }
    }
    if (addedCount === 0) {
      break;
    }

    selectedRegionTopLeft = Elementwise.map(i => {
      return Math.min(...cardsToSelect.map(x => x.location[i]));
    });
    selectedRegionBottomRight = Elementwise.map(i => {
      return Math.max(...cardsToSelect.map(x => x.location[i]));
    });
  }

  cardsToSelect.sort((a, b) => b.zIndex - a.zIndex);

  // If we have already selected some cards we should select everything rather than
  // just the cards in the same faceUp state as the top one
  let selectAll = cardClicked.selected;

  let clickedIndex = cardsToSelect.map(x => x.id).indexOf(cardClicked.id);
  let newState: CardState = {
    ...state,
    selectionActive: cardsToSelect.length > 0,
  };
  newState.cardsById[cardClicked.id] = {...cardClicked, selected: true};

  for(let i = clickedIndex + 1; i < cardsToSelect.length; i++) {
    let card = cardsToSelect[i];
    if(!selectAll && card.faceUp !== cardClicked.faceUp) {
      break;
    }

    newState.cardsById[card.id] = {...card, selected: true};
  }

  for(let i = clickedIndex - 1; i >= 0; i--) {
    let card = cardsToSelect[i];
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

  let newState: CardState = {
    ...state,
    selectionActive: false,
  };
  Object.values(state.cardsById)
    .forEach(card => {
      if(card.selected) {
        newState.cardsById[card.id] = {...card, selected: false};
      }
    });
  return newState;
}
