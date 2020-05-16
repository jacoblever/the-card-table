import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { pickUpCard, turnOverCard, moveCard, dropCard, ActionTypes } from './store/actions'

import { AppState, CardOwner, Coordinates } from "./store/state";
import { CardComponent } from './CardComponent'

import Suit from './Suit'

type Props = {
  id: string,
  suit: Suit,
  number: number,
  faceUp: boolean,
  zIndex: number,
  movable: boolean,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  heldBy: state.cards.cardsById[ownProps.id].heldBy,
  location: state.cards.cardsById[ownProps.id].location,
  zIndex: state.cards.cardsById[ownProps.id].zIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  onClick: () => dispatch(turnOverCard(ownProps.id)),
  onPickUp: () => dispatch(pickUpCard(ownProps.id)),
  onMove: (location: Coordinates) => dispatch(moveCard(ownProps.id, location)),
  onDrop: (location: Coordinates, nowHeldBy: CardOwner) => dispatch(dropCard(ownProps.id, location, nowHeldBy)),
});

export const CardContainer =  connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
