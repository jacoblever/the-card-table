export class WebSocketConnection {
  private _webSocket: WebSocket | null = null
  private _onRemoteEvent: (event: MessageEvent) => void;

  constructor(onRemoteEvent: (event: MessageEvent) => void) {
    this._onRemoteEvent = onRemoteEvent;
  }

  public connect() {
    let socket = new WebSocket("wss://echo.websocket.org");

    // TODO: Just for testing, remove this
    (window as any).sendToSocket = (data: {}) => {
      socket.send(JSON.stringify(data));
    };

    socket.onopen = (event) => {
      this._webSocket = socket;
      console.log("socket open");
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log(event.data);
      this.handleMessage(event);
    };

    socket.onclose = (event) => {
      console.log("socket closed");
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
