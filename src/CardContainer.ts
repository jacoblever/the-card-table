import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { pickUpCard, turnOverCard, moveCard, dropCard } from './store/actions'

import { AppState, ActionTypes } from "./store/types";
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
  location: state.cards.cardsById[ownProps.id].location,
  zIndex: state.cards.cardsById[ownProps.id].zIndex,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  onClick: () => dispatch(turnOverCard(ownProps.id)),
  onPickUp: () => dispatch(pickUpCard(ownProps.id)),
  onMove: (x: number, y: number) => dispatch(moveCard(ownProps.id, [x, y])),
  onDrop: (x: number, y: number) => dispatch(dropCard(ownProps.id, [x, y])),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
