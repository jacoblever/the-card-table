import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, Player } from "./store/state";
import { ActionTypes, kickPlayer } from './store/actions';
import { OtherPlayerHandComponent } from "./OtherPlayerHandComponent";

type Props = {
  player: Player,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  cards: Object.keys(state.cards.cardsById)
    .map(cardId => state.cards.cardsById[cardId])
    .filter(card => card.heldBy === ownProps.player.id),
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
  kickPlayer: () => dispatch(kickPlayer(ownProps.player.id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OtherPlayerHandComponent);
