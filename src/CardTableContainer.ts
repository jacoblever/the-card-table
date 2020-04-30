import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState, ActionTypes } from "./store/types";
import CardTableComponent from './CardTableComponent'

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  cards: state.cards.cardsById,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardTableComponent);
