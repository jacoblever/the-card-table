import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import { ActionTypes, changeRoom } from './store/actions';
import { LobbyComponent } from "./LobbyComponent";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
});

const mapDispatchToProps = (dispatch: Dispatch<ActionTypes>, ownProps: {}) => ({
  onJoinRoom: (roomId: string) => dispatch(changeRoom(roomId)),
});

export const LobbyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LobbyComponent);
