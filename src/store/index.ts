import { createStore, applyMiddleware, Store } from "redux";
import reduxThunk, { ThunkMiddleware } from 'redux-thunk';

import { rootReducer } from "./reducers/reducers";
import socketMiddleware from '../server/websocket';
import { AppState } from "./state";
import { Dispatch } from "react";
import { AppAction} from "./actions/actions";
import { changeRoom } from "./actions/room_actions";
import { getRoomIdFromUrl } from "./reducers/room_id_reducer";

function handleHistoryBack(store: Store<AppState, AppAction>) {
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
      socketMiddleware as ThunkMiddleware<AppState, AppAction, Dispatch<AppAction>>,
    ),
  );
  handleHistoryBack(store);
  return store;
}
