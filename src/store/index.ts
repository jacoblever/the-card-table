import { createStore, combineReducers, applyMiddleware, Store } from "redux";
import reduxThunk, { ThunkMiddleware } from 'redux-thunk';

import { CardsReducer, getRoomIdFromUrl, RoomIdReducer } from "./reducers";
import socketMiddleware from '../server/websocket';
import { AppState } from "./state";
import { Dispatch } from "react";
import { ActionTypes, changeRoom } from "./actions";

const rootReducer = combineReducers({
  cards: CardsReducer,
  roomId: RoomIdReducer,
});

function handleHistoryBack(store: Store<AppState, ActionTypes>) {
  window.addEventListener('popstate', () => {
    let currentRoomId = store.getState().roomId;
    let roomIdFromUrl = getRoomIdFromUrl();
    if (currentRoomId !== roomIdFromUrl) {
      store.dispatch(changeRoom(roomIdFromUrl));
    }
  });
}

export default function configureStore() {
  let store = createStore(
    rootReducer,
    applyMiddleware(
      reduxThunk,
      socketMiddleware as ThunkMiddleware<AppState, ActionTypes, Dispatch<ActionTypes>>,
    ),
  );
  handleHistoryBack(store);
  return store;
}
