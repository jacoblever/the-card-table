import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { pickUpCard, turnOverCard, moveCard, dropCard, ActionTypes, selectCardsUnder } from './store/actions'

import { AppState, CardOwner, Coordinates } from "./store/state";
import { CardComponent } from './CardComponent'

type Props = {
  id: string,
  forceFaceDown?: boolean,
  movable: boolean,
}

const mapStateToProps = (state: AppState, ownProps: Props) => {
  let card = state.cards.cardsById[ownProps.id];
  return {
    heldBy: card.heldBy,
    faceUp: ownProps.forceFaceDown || card.forceFaceDown ? false : card.faceUp,
    suit: card.suit,
    number: card.number,
    location: card.location,
    zIndex: card.zIndex,
    selected: card.selected,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  onTurnOver: () => dispatch(turnOverCard(ownProps.id)),
  onSelectUnder: () => dispatch(selectCardsUnder(ownProps.id)),
  onPickUp: () => dispatch(pickUpCard(ownProps.id)),
  onMove: (location: Coordinates) => dispatch(moveCard(ownProps.id, location)),
  onDrop: (location: Coordinates, zIndex: number, nowHeldBy: CardOwner) => dispatch(dropCard(ownProps.id, location, zIndex, nowHeldBy)),
});

export const CardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
