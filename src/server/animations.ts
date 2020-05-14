import { Card, CardOwner, CardOwnerTable, Location } from "../store/state";
import { ActionTypes, dropCard, moveCard, pickUpCard } from "../store/actions";
import { LocationTransformer } from "../geometry/locationTransformer";

export const animateMoveCard = (card: Card, endLocation: number[], nowHeldBy: CardOwner, me: string, dispatch: (action: ActionTypes) => void) => {
  let duration = 200;
  let framesPerSecond = 60;
  let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
  let stepNumber = 1;

  let startLocation = [card.location[0], card.location[1]];

  let dropCardAction: () => void = () => {};

  // Card moved from table to someone's (and possibly your) hand
  if (card.heldBy === CardOwnerTable && nowHeldBy !== CardOwnerTable) {
    let locationInHand: Location = nowHeldBy === me ? [150, 10] : [0, 0];
    let end = new LocationTransformer(locationInHand, nowHeldBy).transformTo(CardOwnerTable);
    endLocation = [end[0], end[1]];

    dropCardAction = () => {
      dispatch(dropCard(card.id, [locationInHand[0], locationInHand[1]], nowHeldBy, true));
    };
  }

  // Card moved from someone's (NOT your) hand to the table
  if (card.heldBy !== CardOwnerTable && nowHeldBy === CardOwnerTable) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo(CardOwnerTable);
    startLocation = [start[0], start[1]];
    dispatch(dropCard(card.id, [start[0], start[1]], CardOwnerTable, true));
  }

  // Card moved from someone's (NOT your) hand to your hand
  if (card.heldBy !== CardOwnerTable && nowHeldBy === me) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo(me);
    startLocation = [start[0], start[1]];
    dispatch(dropCard(card.id, [start[0], start[1]], nowHeldBy, true));
    endLocation = [150, 10];
  }

  // Card moved from someone's (NOT your) hand to another hand (NOT yours)
  if (card.heldBy !== CardOwnerTable && nowHeldBy !== CardOwnerTable && nowHeldBy !== me && card.heldBy !== nowHeldBy) {
    let start = new LocationTransformer([0, 0], card.heldBy).transformTo("card-table");
    startLocation = [start[0], start[1]];
    let end = new LocationTransformer([0, 0], nowHeldBy).transformTo("card-table");
    dispatch(dropCard(card.id, [start[0], start[1]], CardOwnerTable, true));
    endLocation = [end[0], end[1]];
    dropCardAction = () => {
      dispatch(dropCard(card.id, [0, 0], nowHeldBy, true));
    };
  }

  dispatch(pickUpCard(card.id));

  let animationStep = () => {
    setTimeout(() => {
      if (stepPercent * stepNumber <= 1) {
        let nextLocation = [0, 1].map(i => {
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
