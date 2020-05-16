import { Dispatch, Store } from "redux";
import { AppState, CardOwnerTable } from "../store/state";
import { animateMoveCard } from "./animations";
import { ActionTypes, DROP_CARD, TURN_OVER_CARD, turnOverCard, WS_CONNECT, WS_DISCONNECT } from "../store/actions";

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
    let currentState = store.getState();
    switch (message.type) {
      case DROP_CARD:
        let endLocation = message.location;
        animateMoveCard(
          currentState.cards.cardsById[message.cardId],
          endLocation,
          message.nowHeldBy,
          currentState.cards.me,
          (a: ActionTypes) => store.dispatch(a),
        )
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
        let remoteAction = {
          ...action,
          remote: true
        };
        socket.send(JSON.stringify({"message":"sendmessage", "data": JSON.stringify(remoteAction)}));
        break;
      default:
        break;
    }
    next(action);

    if(action.type === DROP_CARD && !action.remote) {
      let state = store.getState();
      let droppedToOtherPlayer = action.nowHeldBy !== CardOwnerTable && action.nowHeldBy !== state.cards.me;
      if(droppedToOtherPlayer) {
        if(action.location !== [0, 0]) {
          animateMoveCard(
            state.cards.cardsById[action.cardId],
            [0, 0],
            action.nowHeldBy,
            state.cards.me,
            (a: ActionTypes) => store.dispatch(a),
          );
        }
      }
    }
  };
};

export default socketMiddleware();
