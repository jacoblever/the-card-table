import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, ActionTypes } from "./store/types";
import CardTableComponent from './CardTableComponent'
import { wsConnect, wsDisconnect } from './store/actions';

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: state.cards.cardsById,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
  onMount: () => dispatch(wsConnect()),
  onUnmount: () => dispatch(wsDisconnect()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardTableComponent);
