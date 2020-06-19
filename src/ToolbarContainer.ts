import { connect } from 'react-redux'

import { AppState, CardOwnerTable, Coordinates } from "./store/state";
import { AppThunkDispatch } from './store/actions/actions';
import { ToolbarComponent } from "./ToolbarComponent";
import { closeDealModal, openDealModal } from "./store/actions/card_actions";
import { dealCards, meanLocation, shuffleSelectedCards, tidySelectedCards } from "./store/actions/card_thunk_actions";
import { LocationTransformer } from "./geometry/locationTransformer";

function getLocation(state: AppState): Coordinates {
  let cards = Object.values(state.room.cardsById).filter(x => x.selected);
  if(cards.length === 0) {
    return [0, 0];
  }
  let location = new LocationTransformer(meanLocation(cards), cards[0].heldBy)
    .transformTo(CardOwnerTable);
  return [location[0] - 40, location[1] - 30];
}

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  location: getLocation(state),
  showDealModal: state.room.dealModal.show,
  defaultNumberToEachPlayer: state.room.dealModal.defaultDealNumber,
});

const mapDispatchToProps = (dispatch: AppThunkDispatch, ownProps: {}) => ({
  tidy: () => dispatch(tidySelectedCards()),
  shuffle: () => dispatch(shuffleSelectedCards()),
  openDealModal: () => dispatch(openDealModal()),
  closeDealModal: () => dispatch(closeDealModal()),
  deal: (numberToEachPlayer: number) => dispatch(dealCards({numberToEachPlayer: numberToEachPlayer})),
});

export const ToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolbarComponent);
