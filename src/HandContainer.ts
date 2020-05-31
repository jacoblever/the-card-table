import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, Player } from "./store/state";
import { ActionTypes, nameChange } from './store/actions';
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandComponent);
