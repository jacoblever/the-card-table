import { connect } from 'react-redux'

import { AppState } from "./store/state";
import {
  AppThunkDispatch,
  closeDealModal, dealCards,
  openDealModal,
  shuffleSelectedCards,
  tidySelectedCards
} from './store/actions';
import { ToolbarComponent } from "./ToolbarComponent";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  showDealModal: state.cards.showDealModal,
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
