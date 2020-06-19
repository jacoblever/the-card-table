import { AppAction } from "../actions/actions";
import { CHANGE_ROOM } from "../actions/room_actions";

export function getRoomIdFromUrl(): string | null {
  if(window.location.pathname === '/') {
    return null;
  }
  return window.location.pathname.split('/').slice(1).join('/');
}

export function RoomIdReducer(
  state: string,
  action: AppAction,
): string | null {
  if (state === undefined) {
    return getRoomIdFromUrl()
  }

  if(action.type === CHANGE_ROOM) {
    return action.roomId;
  }
  return state;
}
