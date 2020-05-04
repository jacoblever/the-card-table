import { ActionTypes, DROP_CARD, Card, TURN_OVER_CARD } from "../store/types";
import { moveCard, turnOverCard, pickUpCard } from "../store/actions";

const animateMoveCard = (card: Card, endLocation: number[], dispatcher: (action: ActionTypes) => void) => {
  let duration = 200;
  let framesPerSecond = 60;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let startLocation = [card.location[0], card.location[1]];

  dispatcher(pickUpCard(card.id));

  let animationStep = function () {
    setTimeout(() => {
      if (stepPercent * stepNumber < 1) {
        let nextLocation = [0, 1].map(i => {
          return startLocation[i] + stepPercent * stepNumber * (endLocation[i] - startLocation[i]);
        });
        dispatcher(moveCard(card.id, nextLocation));

        stepNumber += 1;
        window.requestAnimationFrame(animationStep);
      }
    }, 1000 / framesPerSecond);
  }

  window.requestAnimationFrame(animationStep);
};

export function handleRemoteEvent(event: MessageEvent, cardsById: { [key: string]: Card; }, dispatcher: (action: ActionTypes) => void): void {
  let message = JSON.parse(event.data) as ActionTypes;

  switch (message.type) {
    case DROP_CARD:
      let endLocation = message.location;
      animateMoveCard(cardsById[message.cardId], endLocation, dispatcher)
      break;
    case TURN_OVER_CARD:
      dispatcher(turnOverCard(message.cardId, true));
      break;
    default:
      break;
  }
};
