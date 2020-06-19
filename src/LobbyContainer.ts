import { connect } from 'react-redux'
import { Dispatch } from 'redux';

import { AppState } from "./store/state";
import { AppAction} from './store/actions/actions';
import { LobbyComponent } from "./LobbyComponent";
import { changeRoom } from "./store/actions/room_actions";

const mapStateToProps = (state: AppState, ownProps: {}) => ({
});

const mapDispatchToProps = (dispatch: Dispatch<AppAction>, ownProps: {}) => ({
  onJoinRoom: (roomId: string) => dispatch(changeRoom(roomId)),
});

export const LobbyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LobbyComponent);
