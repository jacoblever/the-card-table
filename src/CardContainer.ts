import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { pickUpCard, turnOverCard, moveCard, dropCard, ActionTypes } from './store/actions'

import { AppState, CardOwner } from "./store/state";
import { CardComponent } from './CardComponent'

import Suit from './Suit'

type Props = {
  id: string,
  suit: Suit,
  number: number,
  faceUp: boolean,
  zIndex: number,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  heldBy: state.cards.cardsById[ownProps.id].heldBy,
  location: state.cards.cardsById[ownProps.id].location,
  zIndex: state.cards.cardsById[ownProps.id].zIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  onClick: () => dispatch(turnOverCard(ownProps.id)),
  onPickUp: () => dispatch(pickUpCard(ownProps.id)),
  onMove: (x: number, y: number) => dispatch(moveCard(ownProps.id, [x, y])),
  onDrop: (location: number[], nowHeldBy: CardOwner) => dispatch(dropCard(ownProps.id, location, nowHeldBy)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
