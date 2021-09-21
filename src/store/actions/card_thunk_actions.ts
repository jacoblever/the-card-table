import { AppAction, AppThunkAction, AppThunkDispatch } from "./actions";
import { Dispatch } from "redux";
import { AppState, Card, CardOwner, CardOwnerTable, Coordinates, Player } from "../state";
import { Elementwise } from "../../geometry/elementwise";
import { LocationTransformer } from "../../geometry/locationTransformer";
import { animateDropCard } from "../../server/animations";
import { INITIAL_PACK_LOCATION } from "../../constants";
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

function groupBy<T, V>(items: T[], predicate: (item: T) => V): {key: V, items: T[]}[] {
  let resultKeys = new Set<V>();
  items.forEach(item => resultKeys.add(predicate(item)));

  let results: {key: V, items: T[]}[] = Array.from(resultKeys)
    .map(x => {
      return {key: x, items: []}
    });

  items.forEach(item => {
    let key = predicate(item);
    let resultObj = results.filter(x => x.key === key)[0];
    resultObj.items.push(item);
  });

  return results;
}


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

async function shuffleCards(dispatch: AppThunkDispatch, cards: Card[]) {
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

export function shuffleSelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().room.cardsById);
    await dispatch(deselectAllCards());
    await shuffleCards(dispatch, cards);
  }
}

async function tidyCards(dispatch: AppThunkDispatch, cards: Card[]) {
  let cardsToTidy = cards.sort((a, b) => a.zIndex - b.zIndex);
  let newLocation = meanLocation(cardsToTidy);
  await dispatch(animateDropCard(dropCards(
    cardsToTidy[0].heldBy,
    cardsToTidy.map((x, i) => {
      return {
        cardId: x.id,
        location: [
          newLocation[0] + tidyOffset * i - cardsToTidy.length * tidyOffset / 2,
          newLocation[1] - tidyOffset * i + cardsToTidy.length * tidyOffset / 2
        ],
        zIndex: x.zIndex,
      };
    }),
  )));
}

export function tidySelectedCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let cards = getCardsGroup(getState().room.cardsById);
    await dispatch(deselectAllCards());
    await tidyCards(dispatch, cards);
  }
}

let getStartAndOverlap = (handWidth: number, cardCount: number) => {
  let cardWidth = 60;
  let maximumOverlap = 30;

  let maximumBlockWidth = (cardCount-1)*maximumOverlap + cardWidth;
  if(maximumBlockWidth < handWidth*0.9) {
    return {
      startX: (handWidth - maximumBlockWidth) / 2,
      overlap: maximumOverlap,
    }
  }

  let spaceForCards = handWidth*0.9;
  let spaceForCardsAllExcept1 = spaceForCards - cardWidth;
  let overlap = spaceForCardsAllExcept1 / (cardCount-1);
  return {
    startX: handWidth*0.05,
    overlap: overlap,
  }
}

export function arrangeHand(handWidth: number): AppThunkAction<void, number> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let state = getState();
    let cardsInHand = Object.keys(state.room.cardsById)
      .map(id => state.room.cardsById[id])
      .filter(card => card.heldBy === state.room.me)
      .sort((a, b) => {
        let locationSort = a.location[0] - b.location[0];
        if(locationSort !== 0) {
          return locationSort;
        }
        return a.zIndex - b.zIndex;
      });

    if(cardsInHand.length === 0) {
      return
    }

    let cardCount = cardsInHand.length;
    let startAndOverlap = getStartAndOverlap(handWidth, cardCount);

    await dispatch(animateDropCard(dropCards(
      cardsInHand[0].heldBy,
      cardsInHand.map((x, i) => {
        return {
          cardId: x.id,
          location: [
            startAndOverlap.startX + startAndOverlap.overlap * i,
            40,
          ],
          zIndex: i,
        };
      }),
    )));
  }
}

export function faceUpHand(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let state = getState();
    let cardsInHand = Object.keys(state.room.cardsById)
      .map(id => state.room.cardsById[id])
      .filter(card => card.heldBy === state.room.me);

    if(cardsInHand.length === 0) {
      return
    }

    await dispatch(dropCards(
      cardsInHand[0].heldBy,
      cardsInHand.map((x, i) => {
        return {
          cardId: x.id,
          location: x.location,
          zIndex: x.zIndex,
          turnOver: !x.faceUp,
        };
      }),
    ));
  }
}

async function asyncForEach<T>(array: T[], callback: (item: T, index: number, array: T[]) => void) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function regatherAllCards(): AppThunkAction<void, null> {
  return async (dispatch: AppThunkDispatch, getState: () => AppState) => {
    let state = getState();
    let allCards = Object.keys(state.room.cardsById)
      .map(id => state.room.cardsById[id]);

    let handGroups = groupBy(allCards, x => x.heldBy);
    await asyncForEach(handGroups, async (handGroups) => {
      await dispatch(dropCards(
        handGroups.key,
        handGroups.items.map((x, i) => {
          return {
            cardId: x.id,
            location: x.location,
            zIndex: x.zIndex,
            turnOver: x.faceUp,
          };
        }),
      ));
    });

    const gatherGitterAmplitude = 10;

    await dispatch(animateDropCard(dropCards(
      CardOwnerTable,
      allCards.map((x, i) => {
        return {
          cardId: x.id,
          location: Elementwise.map(i => INITIAL_PACK_LOCATION[i] + gatherGitterAmplitude * (Math.random() * 2 - 1)),
          zIndex: x.zIndex,
          turnOver: false,
        };
      }),
    )));

    await sleep(1500);

    let newState = getState();
    let newAllCards = Object.keys(newState.room.cardsById)
      .map(id => newState.room.cardsById[id]);

    await shuffleCards(dispatch, newAllCards);
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
