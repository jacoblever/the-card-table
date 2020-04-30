import { createStore, combineReducers } from "redux";

import { CardsReducer } from "./reducers";

const rootReducer = combineReducers({
  cards: CardsReducer,
});


export default function configureStore() {
  return createStore(
    rootReducer
  );
}
