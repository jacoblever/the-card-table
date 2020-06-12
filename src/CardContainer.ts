import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { ActionTypes, selectCardsUnder } from './store/actions'

import { AppState, CardOwner, Coordinates } from "./store/state";
import { CardComponent } from './CardComponent'

type Props = {
  id: string,
  forceFaceDown?: boolean,
  movable: boolean,

  onTurnOver: () => void,
  onPickUp: () => void,
  onMove: (location_delta: Coordinates) => void,
  onDrop: (location: Coordinates, zIndex: number, nowHeldBy: CardOwner) => void,
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
  onSelectUnder: () => dispatch(selectCardsUnder(ownProps.id)),
});

export const CardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
