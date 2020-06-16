import { connect } from 'react-redux'

import {
  selectCardsUnder,
  dragCard, AppThunkDispatch, releaseCard, grabCard, flipCard,
} from './store/actions'

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

const mapDispatchToProps = (dispatch: AppThunkDispatch, ownProps: Props) => ({
  onTurnOver: () => dispatch(flipCard({cardId: ownProps.id})),
  onSelectUnder: () => dispatch(selectCardsUnder(ownProps.id)),
  onPickUp: () => dispatch(grabCard({cardId: ownProps.id})),
  onMove: (delta: Coordinates) => dispatch(dragCard({cardId: ownProps.id, delta: delta})),
  onDrop: (nowHeldBy: CardOwner) => dispatch(releaseCard({cardId: ownProps.id, nowHeldBy: nowHeldBy})),
});

export const CardContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
