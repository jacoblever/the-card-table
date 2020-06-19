import { Action } from "redux";

export const CHANGE_ROOM = "CHANGE_ROOM";
export interface ChangeRoomAction extends Action<typeof CHANGE_ROOM> {
  roomId: string | null;
}

export function changeRoom(roomId: string | null): ChangeRoomAction {
  return {
    type: CHANGE_ROOM,
    roomId: roomId,
  };
}
