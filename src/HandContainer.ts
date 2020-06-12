import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, CardOwner, Coordinates, Player } from "./store/state";
import { ActionTypes, dropCard, moveCard, nameChange, pickUpCard, turnOverCard } from './store/actions';
import { HandComponent } from "./HandComponent";

type Props = {
  player: Player,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  cards: Object.keys(state.cards.cardsById)
    .map(cardId => state.cards.cardsById[cardId])
    .filter(card => card.heldBy === ownProps.player.id),
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  changeName: (name: string) => dispatch(nameChange(ownProps.player.id, name)),

  onTurnOver: (cardId: string) => dispatch(turnOverCard(cardId)),
  onPickUp: (cardId: string) => dispatch(pickUpCard(cardId)),
  onMove: (cardId: string, location: Coordinates) => dispatch(moveCard(cardId, location)),
  onDrop: (cardId: string, location: Coordinates, zIndex: number, nowHeldBy: CardOwner) => dispatch(dropCard(cardId, location, zIndex, nowHeldBy)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandComponent);
