import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import { AppAction } from './store/actions/actions';
import App from "./App";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
  roomId: state.roomId,
});

const mapDispatchToProps = (dispatch: Dispatch<AppAction>, ownProps: {}) => ({
});

export const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
