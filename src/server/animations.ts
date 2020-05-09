import { ActionTypes, Card } from "../store/types";
import { moveCard, pickUpCard } from "../store/actions";

export const animateMoveCard = (card: Card, endLocation: number[], dispatch: (action: ActionTypes) => void) => {
  let duration = 200;
  let framesPerSecond = 60;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let startLocation = [card.location[0], card.location[1]];

  dispatch(pickUpCard(card.id));

  let animationStep = () => {
    setTimeout(() => {
      if (stepPercent * stepNumber < 1) {
        let nextLocation = [0, 1].map(i => {
          return startLocation[i] + stepPercent * stepNumber * (endLocation[i] - startLocation[i]);
        });
        dispatch(moveCard(card.id, nextLocation));

        stepNumber += 1;
        window.requestAnimationFrame(animationStep);
      }
    }, 1000 / framesPerSecond);
  };

  window.requestAnimationFrame(animationStep);
};
