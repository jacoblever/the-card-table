import { createStore, combineReducers, applyMiddleware } from "redux";
import dynamicMiddlewares from 'redux-dynamic-middlewares';

import { CardsReducer } from "./reducers";

const rootReducer = combineReducers({
  cards: CardsReducer,
});

export default function configureStore() {
  return createStore(
    rootReducer,
    applyMiddleware(
      dynamicMiddlewares
    ),
  );
}
