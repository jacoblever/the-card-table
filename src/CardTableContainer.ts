import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, CardOwnerTable } from "./store/state";
import CardTableComponent from './CardTableComponent'
import { AppAction } from './store/actions/actions';
import { wsConnect, wsDisconnect } from "./store/actions/websocket_actions";
import { deselectAllCards } from "./store/actions/card_actions";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: Object.keys(state.room.cardsById)
    .map(cardId => state.room.cardsById[cardId])
    .filter(card => card.heldBy === CardOwnerTable),
  players: state.room.players,
  me: state.room.me,
  showToolbar: (() => {
    let selectedCards = Object.values(state.room.cardsById).filter(x => x.selected);
    return selectedCards.length > 0 && selectedCards.filter(x => x.isMoving).length === 0;
  })(),
  webSocketDisconnected: state.room.connection.webSocketDisconnected,
});

const mapDispatchToProps = (dispatch: Dispatch<AppAction>, ownProps: {}) => ({
  onMount: () => dispatch(wsConnect()),
  onUnmount: () => dispatch(wsDisconnect()),
  onDeselectAllCards: () => dispatch(deselectAllCards()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardTableComponent);
