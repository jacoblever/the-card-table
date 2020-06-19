import { connect } from 'react-redux'

import { AppState } from "./store/state";
import {
  AppThunkDispatch
} from './store/actions/actions';
import { ToolbarComponent } from "./ToolbarComponent";
import {
  closeDealModal,
  openDealModal
} from "./store/actions/card_actions";
import { dealCards, shuffleSelectedCards, tidySelectedCards } from "./store/actions/card_thunk_actions";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
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
