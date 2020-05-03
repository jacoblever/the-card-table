import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, ActionTypes } from "./store/types";
import CardTableComponent from './CardTableComponent'
import { handleRemoteEvent } from './server/handlers';

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: state.cards.cardsById,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
  dispatcher: (action: ActionTypes) => dispatch(action),
});

const mergeProps = (stateProps: ReturnType<typeof mapStateToProps>, dispatchProps: ReturnType<typeof mapDispatchToProps>, ownProps: {}) => ({
  ...ownProps,
  ...stateProps,
  onRemoteEvent: (event: MessageEvent) => {
    handleRemoteEvent(event, stateProps.cards, dispatchProps.dispatcher);
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(CardTableComponent);
