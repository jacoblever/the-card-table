import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import { ActionTypes } from './store/actions';
import { OtherPlayerHandComponent } from "./OtherPlayerHandComponent";

type Props = {
  playerId: string,
}

const mapStateToProps = (state: AppState, ownProps: Props) => ({
  cards: Object.keys(state.cards.cardsById)
    .map(cardId => state.cards.cardsById[cardId])
    .filter(card => card.heldBy === ownProps.playerId),
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: Props) => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OtherPlayerHandComponent);
