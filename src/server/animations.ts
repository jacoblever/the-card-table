import { AppState, Card, CardOwner, CardOwnerTable, Coordinates } from "../store/state";
import { AppAction, AppThunkAction} from "../store/actions/actions";
import { LocationTransformer } from "../geometry/locationTransformer";
import { Elementwise } from "../geometry/elementwise";
import { Dispatch } from "redux";
import { DropCardsAction, moveCards, pickUpCards } from "../store/actions/card_actions";

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

export function animateDropCard(dropCardAction: DropCardsAction): AppThunkAction<void, DropCardsAction> {
  return async (dispatch: Dispatch<AppAction>, getState: () => AppState) => {
    let state = getState();
    let cardsById = state.room.cardsById;
    let me = state.room.me;

    let duration = 300;
    let framesPerSecond = 60;
    let frameLength = 1000 / framesPerSecond;
    let stepPercent = 1 / ((duration / 1000) * framesPerSecond);
    let stepNumber = 1;

    let beingMovedToPrivateArea = ![CardOwnerTable, me].includes(dropCardAction.nowHeldBy);

    let animationDetails = dropCardAction.drops.map(drop => {
      let card = cardsById[drop.cardId];
      let endInFinalOwnersFrame = getEndLocationInFinalOwnersFrame(card, drop.location, dropCardAction.nowHeldBy, me);
      let endInOriginalOwnersFrame = new LocationTransformer(endInFinalOwnersFrame, dropCardAction.nowHeldBy)
        .transformTo(card.heldBy);
      return {
        card: card,
        drop: drop,
        cardIdentitySecret: !card.faceUp || ![CardOwnerTable, me].includes(card.heldBy),
        startInOriginalOwnersFrame: card.location,
        endInFinalOwnersFrame: endInFinalOwnersFrame,
        endInOriginalOwnersFrame: endInOriginalOwnersFrame,
      };
    });

    let dispatchEndState = () => {
      dispatch({
        ...dropCardAction,
        drops: animationDetails.map(d => {
          return {
            ...d.drop,
            location: d.endInFinalOwnersFrame,
          }
        }),
      });
    }

    let animationStep = () => {
      if (stepNumber === 1) {
        dispatch(pickUpCards(animationDetails.map(d => {
          return {cardId: d.card.id, ensureIdentityStaysHidden: d.cardIdentitySecret && beingMovedToPrivateArea};
        })));
      }

      if (stepPercent * stepNumber <= 1) {
        dispatch(moveCards(animationDetails.map(d => {
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
}
