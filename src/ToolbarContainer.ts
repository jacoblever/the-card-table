import { connect } from 'react-redux'

import { AppState } from "./store/state";
import { AppThunkDispatch, shuffleSelectedCards, tidySelectedCards } from './store/actions';
import { ToolbarComponent } from "./ToolbarComponent";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
});

const mapDispatchToProps = (dispatch: AppThunkDispatch, ownProps: {}) => ({
  tidy: () => dispatch(tidySelectedCards()),
  shuffle: () => dispatch(shuffleSelectedCards()),
});

export const ToolbarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolbarComponent);
