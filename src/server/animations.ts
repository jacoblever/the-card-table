import { Card, CardOwner, CardOwnerTable, Coordinates } from "../store/state";
import { ActionTypes, dropCard, moveCard, pickUpCard } from "../store/actions";
import { LocationTransformer } from "../geometry/locationTransformer";
import { Elementwise } from "../geometry/elementwise";

export const animateMoveCard = (card: Card, endLocation: Coordinates, nowHeldBy: CardOwner, me: string, dispatch: (action: ActionTypes) => void) => {
  let duration = 200;
  let framesPerSecond = 60;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let startLocation = card.location;

  let dropCardAction: () => void = () => {};

  // Card moved from table to someone's (and possibly your) hand
  if (card.heldBy === CardOwnerTable && nowHeldBy !== CardOwnerTable) {
    let locationInHand: Coordinates = nowHeldBy === me ? [150, 10] : [0, 0];
    endLocation = new LocationTransformer(locationInHand, nowHeldBy).transformTo(CardOwnerTable);

    dropCardAction = () => {
      dispatch(dropCard(card.id, locationInHand, nowHeldBy, true));
    };
  }

  // Card moved from someone's (NOT your) hand to the table
  if (card.heldBy !== CardOwnerTable && nowHeldBy === CardOwnerTable) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo(CardOwnerTable);
    startLocation = start;
    dispatch(dropCard(card.id, start, CardOwnerTable, true));
  }

  // Card moved from someone's (NOT your) hand to your hand
  if (card.heldBy !== CardOwnerTable && nowHeldBy === me) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo(me);
    startLocation = start;
    dispatch(dropCard(card.id, start, nowHeldBy, true));
    endLocation = [150, 10];
  }

  // Card moved from someone's (NOT your) hand to another hand (NOT yours)
  if (card.heldBy !== CardOwnerTable && nowHeldBy !== CardOwnerTable && nowHeldBy !== me && card.heldBy !== nowHeldBy) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo("card-table");
    startLocation = start;
    let end = new LocationTransformer([0, 0], nowHeldBy).transformTo("card-table");
    dispatch(dropCard(card.id, start, CardOwnerTable, true));
    endLocation = end;
    dropCardAction = () => {
      dispatch(dropCard(card.id, [0, 0], nowHeldBy, true));
    };
  }

  dispatch(pickUpCard(card.id));

  let animationStep = () => {
    setTimeout(() => {
      if (stepPercent * stepNumber <= 1) {
        let nextLocation = Elementwise.map(i => {
          return startLocation[i] + stepPercent * stepNumber * (endLocation[i] - startLocation[i]);
        });
        dispatch(moveCard(card.id, nextLocation));

        if(stepPercent * stepNumber === 1) {
          dropCardAction();
        }

        stepNumber += 1;
        window.requestAnimationFrame(animationStep);
      }
    }, 1000 / framesPerSecond);
  };

  window.requestAnimationFrame(animationStep);
};
