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

let requestAnimationFrameWithOutOfFocusFallback = (func: () => void, cancelTimeout: number, onCancel: () => void) => {
  let handlerRun = false;
  let handler = () => {
    handlerRun = true;
    func();
  };
  let requestId = window.requestAnimationFrame(handler);
  setTimeout(() => {
    if(!handlerRun) {
      window.cancelAnimationFrame(requestId);
      onCancel();
    }
  }, cancelTimeout);
};

type animateMoveCardsParams = {
  me: string,
  nowHeldBy: CardOwner,
  drops: {
    card: Card,
    endLocation: Coordinates,
    finalZIndex: number,
    turnOver: boolean,
  }[],
}

export const animateMoveCard = (params: animateMoveCardsParams, dispatch: (action: ActionTypes) => void) => {
  let duration = 300;
  let framesPerSecond = 60;
  let frameLength = 1000 / framesPerSecond;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let beingMovedToPrivateArea = ![CardOwnerTable, params.me].includes(params.nowHeldBy);

  let animationDetails = params.drops.map(drop => {
    let card = drop.card;
    let endInFinalOwnersFrame = getEndLocationInFinalOwnersFrame(card, drop.endLocation, params.nowHeldBy, params.me);
    let endInOriginalOwnersFrame = new LocationTransformer(endInFinalOwnersFrame, params.nowHeldBy)
      .transformTo(card.heldBy);
    return {
      card: card,
      cardIdentitySecret: !card.faceUp || ![CardOwnerTable, params.me].includes(card.heldBy),
      startInOriginalOwnersFrame: card.location,
      endInFinalOwnersFrame: endInFinalOwnersFrame,
      endInOriginalOwnersFrame: endInOriginalOwnersFrame,
      finalZIndex: drop.finalZIndex,
      turnOver: drop.turnOver,
    };
  });

  let dispatchEndState = () => {
    dispatch(dropCard(
      params.nowHeldBy,
      animationDetails.map(d => {
        return {cardId: d.card.id, location: d.endInFinalOwnersFrame, zIndex: d.finalZIndex, turnOver: d.turnOver};
      }),
      true,
    ));
  }

  let animationStep = () => {
    if (stepNumber === 1) {
      dispatch(pickUpCard(animationDetails.map(d => {
        return {cardId: d.card.id, ensureIdentityStaysHidden: d.cardIdentitySecret && beingMovedToPrivateArea};
      })));
    }

    if (stepPercent * stepNumber <= 1) {
      dispatch(moveCard(animationDetails.map(d => {
        let nextLocation = Elementwise.map(i => {
          let start = d.startInOriginalOwnersFrame;
          let end = d.endInOriginalOwnersFrame;
          return start[i] + stepPercent * stepNumber * (end[i] - start[i]);
        });
        return {cardId: d.card.id, location: nextLocation};
      })));

      if (stepPercent * stepNumber === 1) {
        dispatchEndState()
      }

      stepNumber += 1;
      setTimeout(() => {
        requestAnimationFrameWithOutOfFocusFallback(
          animationStep,
          frameLength + 100,
          () => dispatchEndState());
      }, frameLength);
    }
  };

  requestAnimationFrameWithOutOfFocusFallback(animationStep, frameLength + 100, () => dispatchEndState());
};
