import { Dispatch, Store } from "redux";
import { AppState, ActionTypes, WS_CONNECT, WS_DISCONNECT, TURN_OVER_CARD, DROP_CARD } from "../store/types";
import { animateMoveCard } from "./animations";
import { turnOverCard } from "../store/actions";

const socketMiddleware = () => {
  let socket: WebSocket | null = null;

  const onOpen = (store: Store<AppState, ActionTypes>) => (event: Event) => {
    console.log('websocket open');
  };

  const onClose = (store: Store<AppState, ActionTypes>) => (event: CloseEvent) => {
    console.log('websocket closed');
  };

  const onMessage = (store: Store<AppState, ActionTypes>) => (event: MessageEvent) => {
    let message = JSON.parse(event.data) as ActionTypes;
    switch (message.type) {
      case DROP_CARD:
        let endLocation = message.location;
        animateMoveCard(store.getState().cards.cardsById[message.cardId], endLocation, (a: ActionTypes) => store.dispatch(a))
        break;
      case TURN_OVER_CARD:
        store.dispatch(turnOverCard(message.cardId, true));
        break;
      default:
        break;
    }
  };

  return (store: Store<AppState, ActionTypes>) => (next: Dispatch<ActionTypes>) => (action: ActionTypes) => {
    switch (action.type) {
      case WS_CONNECT:
        if (socket !== null) {
          socket.close();
        }

        socket = new WebSocket("wss://5d9ccucdfa.execute-api.eu-west-1.amazonaws.com/Prod");
        socket.onmessage = onMessage(store);
        socket.onclose = onClose(store);
        socket.onopen = onOpen(store);
        break;
      case WS_DISCONNECT:
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        console.log('websocket closed');
        break;
      case DROP_CARD:
      case TURN_OVER_CARD:
        if (socket === null || socket.readyState !== WebSocket.OPEN || action.remote) {
          break;
        }
        let remoteAction = Object.assign({}, action, { remote: true });
        socket.send(JSON.stringify({"message":"sendmessage", "data": JSON.stringify(remoteAction)}));
        break;
      default:
        break;
    }
    return next(action);
  };
};

export default socketMiddleware();
