import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import { ActionTypes } from './store/actions';
import App from "./App";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  roomId: state.roomId,
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
});

export const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
