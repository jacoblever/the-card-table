import { AppAction, AppThunkAction, AppThunkDispatch } from "./actions";
import { Dispatch } from "redux";
import { AppState, Card, CardOwner, Coordinates, Player } from "../state";
import { Elementwise } from "../../geometry/elementwise";
import { LocationTransformer } from "../../geometry/locationTransformer";
import { animateDropCard } from "../../server/animations";
import {
  closeDealModal,
  deselectAllCards,
  dropCards,
  DropCardsAction,
  moveCards,
  pickUpCards,
  setDefaultDealNumber
} from "./card_actions";

const tidyOffset = 0.2;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCardsGroup(cardsById: { [key: string]: Card; }, cardId: string | null = null): Card[] {
  let selectedCards = Object.keys(cardsById)
    .map(id => cardsById[id])
    .filter(x => x.selected);
  if (cardId && !selectedCards.map(x => x.id).includes(cardId)) {
    return [cardsById[cardId]];
  }
  return selectedCards;
}

export function meanLocation(cards: Card[]) {
  return Elementwise.map(i => {
    let sum = cards.map(x => x.location[i]).reduce((a, x) => a + x);
    return Math.round(sum / cards.length);
  });
}

function getPlayersInOrderWithMeLast(players: Player[], me: string): Player[] {
  let result = [];
  let index = players.findIndex(x => x.id === me);
  for (let i = 0; i < players.length; i++) {
    let indexToAdd = (i + index + 1) % players.length;
    result.push(players[indexToAdd]);
  }
  return result;
}

export type GrabCardParams = {
  cardId: string,
}

export function grabCard(params: GrabCardParams): AppThunkAction<void, GrabCardParams> {
  return async (dispatch: Dispatch<AppAction>, getState: () => AppState) => {
    let cardsToPickUp = getCardsGroup(getState().room.cardsById, params.cardId);

    let pickUps = cardsToPickUp.map(card => {
      return {
        cardId: card.id,
      };
    });
    dispatch(pickUpCards(pickUps));
    return Promise.resolve();
  };
}

export type DragCardParams = {
  cardId: string,
  delta: Coordinates,
}

export function dragCard(params: DragCardParams): AppThunkAction<void, DropCardsAction> {
  return async (dispatch: Dispatch<AppAction>, getState: () => AppState) => {
    let cardsToMove = getCardsGroup(getState().room.cardsById, params.cardId);

    let moves = cardsToMove.map(card => {
      return {
        cardId: card.id,
        location: Elementwise.map(i => card.location[i] + params.delta[i]),
      };
    });
    dispatch(moveCards(moves));
    return Promise.resolve();
  };
}

export type ReleaseCardParams = {
  cardId: string,
  nowHeldBy: CardOwner,
}

export function releaseCard(params: ReleaseCardParams): AppThunkAction<void, ReleaseCardParams> {
  return async (dispatch: Dispatch<AppAction>, getState: () => AppState) => {
    let cardsToDrop = getCardsGroup(getState().room.cardsById, params.cardId);
    dispatch(dropCards(
      params.nowHeldBy,
      cardsToDrop.map(card => {
        let transformedLocation = new LocationTransformer(card.location, card.heldBy)
          .transformTo(params.nowHeldBy);
        return {
          cardId: card.id,
          location: transformedLocation,
          zIndex: card.zIndex,
        };
      }),
    ));
    return Promise.resolve();
  };
}

export type FlipCardParams = {
  cardId: string,
}

export function flipCard(params: FlipCardParams): AppThunkAction<void, FlipCardParams> {
  return async (dispatch: Dispatch<AppAction>, getState: () => AppState) => {
    let cardsToFlip = getCardsGroup(getState().room.cardsById, params.cardId);
    cardsToFlip.sort((a, b) => a.zIndex - b.zIndex);

    dispatch(dropCards(
      cardsToFlip[0].heldBy,
      cardsToFlip.map((card, i) => {
        return {
          cardId: card.id,
          location: card.location,
          zIndex: cardsToFlip[cardsToFlip.length - 1 - i].zIndex,
          turnOver: true,
        };
      }),
    ));
    return Promise.resolve();
  };
}

export function shuffleSelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().room.cardsById);
    await dispatch(deselectAllCards());
    let newLocation = meanLocation(cards);
    let zIndexes = cards.map(x => x.zIndex)
      .sort((a, b) => a - b);

    cards.sort(() => Math.random() - 0.5);

    await dispatch(animateDropCard(dropCards(
      cards[0].heldBy,
      cards.map((x, i) => {
        return {
          cardId: x.id,
          location: [
            newLocation[0] + tidyOffset * i - cards.length * tidyOffset / 2,
            newLocation[1] - tidyOffset * i + cards.length * tidyOffset / 2
          ],
          zIndex: zIndexes[i],
        };
      }),
    )));
  }
}

export function tidySelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().room.cardsById)
      .sort((a, b) => a.zIndex - b.zIndex);
    await dispatch(deselectAllCards());
    let newLocation = meanLocation(cards);
    await dispatch(animateDropCard(dropCards(
      cards[0].heldBy,
      cards.map((x, i) => {
        return {
          cardId: x.id,
          location: [
            newLocation[0] + tidyOffset * i - cards.length * tidyOffset / 2,
            newLocation[1] - tidyOffset * i + cards.length * tidyOffset / 2
          ],
          zIndex: x.zIndex,
        };
      }),
    )));
  }
}

type DealCardsParams = {
  numberToEachPlayer: number,
}

export function dealCards(params: DealCardsParams): AppThunkAction<void, DealCardsParams> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let state = getState();
    await dispatch(closeDealModal());
    let cards = getCardsGroup(state.room.cardsById)
      .sort((a, b) => b.zIndex - a.zIndex);
    let players = getPlayersInOrderWithMeLast(state.room.players, state.room.me);
    await dispatch(deselectAllCards());
    await dispatch(setDefaultDealNumber(params.numberToEachPlayer));

    let cardIndex = 0;
    for (let i = 0; i < params.numberToEachPlayer; i++) {
      if (cardIndex >= cards.length) {
        break;
      }
      for (let j = 0; j < players.length; j++) {
        if (cardIndex >= cards.length) {
          break;
        }
        let player = players[j];
        await dispatch(animateDropCard(dropCards(
          player.id,
          [{
            cardId: cards[cardIndex].id,
            location: player.id === state.room.me ? [150, 10] : [0, 0],
            zIndex: cards[cardIndex].zIndex,
          }],
        )));
        await sleep(400);
        cardIndex++;
      }
      await sleep(300);
    }
  }
}
