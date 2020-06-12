import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, CardOwner, CardOwnerTable, Coordinates } from "./store/state";
import CardTableComponent from './CardTableComponent'
import {
  ActionTypes,
  deselectAllCards, dropCard,
  moveCard,
  pickUpCard,
  turnOverCard,
  wsConnect,
  wsDisconnect
} from './store/actions';

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: Object.keys(state.cards.cardsById)
    .map(cardId => state.cards.cardsById[cardId])
    .filter(card => card.heldBy === CardOwnerTable),
  players: state.cards.players,
  me: state.cards.me,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
  onMount: () => dispatch(wsConnect()),
  onUnmount: () => dispatch(wsDisconnect()),
  onDeselectAllCards: () => dispatch(deselectAllCards()),

  onTurnOver: (cardId: string) => dispatch(turnOverCard(cardId)),
  onPickUp: (cardId: string) => dispatch(pickUpCard(cardId)),
  onMove: (cardId: string, location: Coordinates) => dispatch(moveCard(cardId, location)),
  onDrop: (cardId: string, location: Coordinates, zIndex: number, nowHeldBy: CardOwner) => dispatch(dropCard(cardId, location, zIndex, nowHeldBy)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardTableComponent);
