import { createStore, combineReducers, applyMiddleware } from "redux";
import reduxThunk, { ThunkMiddleware } from 'redux-thunk';

import { CardsReducer } from "./reducers";
import socketMiddleware from '../server/websocket';
import { AppState } from "./state";
import { Dispatch } from "react";
import { ActionTypes } from "./actions";

const rootReducer = combineReducers({
  cards: CardsReducer,
});

export default function configureStore() {
  return createStore(
    rootReducer,
    applyMiddleware(
      reduxThunk,
      socketMiddleware as ThunkMiddleware<AppState, ActionTypes, Dispatch<ActionTypes>>,
    ),
  );
}
