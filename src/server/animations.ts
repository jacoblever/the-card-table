import { Card, CardOwner, CardOwnerTable, Coordinates } from "../store/state";
import { ActionTypes, dropCard, moveCard, pickUpCard } from "../store/actions";
import { LocationTransformer } from "../geometry/locationTransformer";
import { Elementwise } from "../geometry/elementwise";

let getEndLocationInFinalOwnersFrame = (card: Card, endLocation: Coordinates, nowHeldBy: CardOwner, me: string) => {
  if (nowHeldBy === CardOwnerTable) {
    return endLocation;
  }
  if (nowHeldBy === me && card.heldBy === me) {
    return endLocation;
  }
  if (nowHeldBy === me && card.heldBy !== me) {
    return [150, 10] as Coordinates;
  }
  return [0, 0] as Coordinates;
}

export const animateMoveCard = (card: Card, endLocation: Coordinates, finalZIndex: number, nowHeldBy: CardOwner, me: string, dispatch: (action: ActionTypes) => void) => {
  let duration = 300;
  let framesPerSecond = 60;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let startInOriginalOwnersFrame = card.location;
  let endInFinalOwnersFrame = getEndLocationInFinalOwnersFrame(card, endLocation, nowHeldBy, me);

  let endInOriginalOwnersFrame = new LocationTransformer(endInFinalOwnersFrame, nowHeldBy)
    .transformTo(card.heldBy);

  let dispatchEndState = () => {
    dispatch(dropCard(card.id, endInFinalOwnersFrame, finalZIndex, nowHeldBy, true));
  };

  let requestAnimationFrameWithOutOfFocusFallback = (func: () => void) => {
    let handlerRun = false;
    let handler = () => {
      handlerRun = true;
      func();
    };
    let requestId = window.requestAnimationFrame(handler);
    setTimeout(() => {
      if(!handlerRun) {
        window.cancelAnimationFrame(requestId);
        dispatchEndState();
      }
    }, 100);
  };

  let animationStep = () => {
    if(stepNumber === 1) {
      dispatch(pickUpCard(card.id));
    }

    if (stepPercent * stepNumber <= 1) {
      let nextLocation = Elementwise.map(i => {
        let start = startInOriginalOwnersFrame;
        let end = endInOriginalOwnersFrame;
        return start[i] + stepPercent * stepNumber * (end[i] - start[i]);
      });
      dispatch(moveCard(card.id, nextLocation));

      if(stepPercent * stepNumber === 1) {
        dispatchEndState();
      }

      stepNumber += 1;
      setTimeout(() => {
        requestAnimationFrameWithOutOfFocusFallback(animationStep);
      }, 1000 / framesPerSecond);
    }
  };

  requestAnimationFrameWithOutOfFocusFallback(animationStep);
};
