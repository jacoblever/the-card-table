import { connect } from 'react-redux'

import { AppState, Player } from "./store/state";
import { AppThunkDispatch} from './store/actions/actions';
import { HandComponent } from "./HandComponent";
import { nameChange } from "./store/actions/player_actions";
import {arrangeHand, faceUpHand, regatherAllCards} from "./store/actions/card_thunk_actions";

type Props = {
  player: Player,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  cards: Object.keys(state.room.cardsById)
    .map(cardId => state.room.cardsById[cardId])
    .filter(card => card.heldBy === ownProps.player.id),
});

const mapDispatchToProps = (dispatch: AppThunkDispatch, ownProps: Props) => ({
  changeName: (name: string) => dispatch(nameChange(ownProps.player.id, name)),
  arrangeHand: (handWidth: number) => dispatch(arrangeHand(handWidth)),
  faceUpHand: () => dispatch(faceUpHand()),
  regatherAllCards: () => dispatch(regatherAllCards()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandComponent);
