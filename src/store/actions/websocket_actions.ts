import { Action } from "redux";


export const WS_CONNECT = "WS_CONNECT";
export interface WsConnectAction extends Action<typeof WS_CONNECT> {
  type: typeof WS_CONNECT;
}

export function wsConnect(): WsConnectAction {
  return {
    type: WS_CONNECT,
  };
}

export const WS_DISCONNECT = "WS_DISCONNECT";
export interface WsDisconnectAction extends Action<typeof WS_DISCONNECT> {
  type: typeof WS_DISCONNECT;
}

export function wsDisconnect(): WsDisconnectAction {
  return {
    type: WS_DISCONNECT,
  };
}

export const WS_DISCONNECTED = "WS_DISCONNECTED";
export interface WsDisconnectedAction extends Action<typeof WS_DISCONNECTED> {
  type: typeof WS_DISCONNECTED;
}

export function wsDisconnected(): WsDisconnectedAction {
  return {
    type: WS_DISCONNECTED,
  };
}

export type WebsocketActions =
  WsConnectAction
  | WsDisconnectAction
  | WsDisconnectedAction;
