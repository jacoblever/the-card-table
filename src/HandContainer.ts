import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, Player } from "./store/state";
import { AppAction} from './store/actions/actions';
import { HandComponent } from "./HandComponent";
import { nameChange } from "./store/actions/player_actions";

type Props = {
  player: Player,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  cards: Object.keys(state.room.cardsById)
    .map(cardId => state.room.cardsById[cardId])
    .filter(card => card.heldBy === ownProps.player.id),
});

const mapDispatchToProps = (dispatch: Dispatch<AppAction>, ownProps: Props) => ({
  changeName: (name: string) => dispatch(nameChange(ownProps.player.id, name)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandComponent);
