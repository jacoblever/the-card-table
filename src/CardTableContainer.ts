import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, CardOwnerTable } from "./store/state";
import CardTableComponent from './CardTableComponent'
import { ActionTypes, deselectAllCards, wsConnect, wsDisconnect } from './store/actions';

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: Object.keys(state.cards.cardsById)
    .map(cardId => state.cards.cardsById[cardId])
    .filter(card => card.heldBy === CardOwnerTable),
  players: state.cards.players,
  me: state.cards.me,
  showToolbar: state.cards.selectionActive,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
  onMount: () => dispatch(wsConnect()),
  onUnmount: () => dispatch(wsDisconnect()),
  onDeselectAllCards: () => dispatch(deselectAllCards()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardTableComponent);
