import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import CardTableComponent from './CardTableComponent'
import { ActionTypes, wsConnect, wsDisconnect } from './store/actions';

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
