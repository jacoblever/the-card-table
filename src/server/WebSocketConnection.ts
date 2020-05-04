import { addMiddleware, removeMiddleware } from 'redux-dynamic-middlewares'
import { Dispatch, Store } from "redux";

import { ActionTypes, AppState, DROP_CARD, TURN_OVER_CARD } from '../store/types'

export class WebSocketConnection {
  private _webSocket: WebSocket | null = null
  private _onRemoteEvent: (event: MessageEvent) => void;

  private _middleware = (store: Store<AppState, ActionTypes>) => (next: Dispatch<ActionTypes>) => (action: ActionTypes) => {
    next(action);
    if (!action.remote && this._webSocket !== null && this._webSocket.readyState === WebSocket.OPEN) {
      let remoteAction = Object.assign({}, action, { remote: true });
      switch (action.type) {
        case DROP_CARD:
        case TURN_OVER_CARD:
          this._webSocket.send(JSON.stringify({"message":"sendmessage", "data": JSON.stringify(remoteAction)}));
          break;
        default:
          break;
      }
    }
  };

  constructor(onRemoteEvent: (event: MessageEvent) => void) {
    this._onRemoteEvent = onRemoteEvent;
  }

  public connect() {
    let socket = new WebSocket("wss://5d9ccucdfa.execute-api.eu-west-1.amazonaws.com/Prod");

    // TODO: Just for testing, remove this
    (window as any).sendToSocket = (data: {}) => {
      socket.send(JSON.stringify(data));
    };

    socket.onopen = (event) => {
      this._webSocket = socket;
      console.log("socket open");
      addMiddleware(this._middleware)
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log(event.data);
      this.handleMessage(event);
    };

    socket.onclose = (event) => {
      console.log("socket closed");
      removeMiddleware(this._middleware);
      this._webSocket = null;
    };
  }

  public close() {
    this._webSocket?.close()
  }

  private handleMessage(event: MessageEvent) {
    this._onRemoteEvent(event);
  }
}
