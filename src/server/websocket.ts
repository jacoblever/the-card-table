import { Dispatch, Store } from "redux";
import Cookies from "js-cookie"
import { AppState, CardOwnerTable } from "../store/state";
import { animateMoveCard } from "./animations";
import {
  ActionTypes,
  DROP_CARD,
  INITIAL_CARD_STATE,
  NAME_CHANGE,
  PLAYERS_UPDATE,
  TURN_OVER_CARD,
  turnOverCard,
  WS_CONNECT,
  WS_DISCONNECT
} from "../store/actions";

function getRoomId() {
  return window.location.pathname.split('/')[1];
}

function getWebSocketPath() {
  let roomId = getRoomId();
  let playerId = Cookies.get(`playerId-${roomId}`) ?? "NewPlayer";
  let playerName = Cookies.get("default-name") ?? "";

  return `wss://n150j0q9lf.execute-api.eu-west-1.amazonaws.com/Prod?room-id=${roomId}&player-id=${playerId}&player-name=${playerName}`;
}

const socketMiddleware = () => {
  let socket: WebSocket | null = null;

  const onOpen = (store: Store<AppState, ActionTypes>) => (event: Event) => {
    console.log('websocket open');
    let action = {
      type: "GET_INITIAL_STATE",
    };
    socket!.send(JSON.stringify({
      "message":"sendmessage",
      "data": JSON.stringify(action),
      "roomId": getRoomId(),
    }));
  };

  const onClose = (store: Store<AppState, ActionTypes>) => (event: CloseEvent) => {
    console.log('websocket closed');
  };

  const onMessage = (store: Store<AppState, ActionTypes>) => (event: MessageEvent) => {
    let message = JSON.parse(event.data) as ActionTypes;
    let currentState = store.getState();
    switch (message.type) {
      case DROP_CARD:
        animateMoveCard(
          currentState.cards.cardsById[message.cardId],
          message.location,
          message.zIndex,
          message.nowHeldBy,
          currentState.cards.me,
          (a: ActionTypes) => store.dispatch(a),
        )
        break;
      case TURN_OVER_CARD:
        store.dispatch(turnOverCard(message.cardId, true));
        break;
      case INITIAL_CARD_STATE:
        Cookies.set(`playerId-${getRoomId()}`, message.state.me)
        store.dispatch(message);
        break;
      case PLAYERS_UPDATE:
        store.dispatch(message);
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

        socket = new WebSocket(getWebSocketPath());
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
      case NAME_CHANGE:
        if (socket === null || socket.readyState !== WebSocket.OPEN || action.remote) {
          break;
        }
        let remoteAction = {
          ...action,
          remote: true
        };
        socket.send(JSON.stringify({
          "message":"sendmessage",
          "data": JSON.stringify(remoteAction),
          "roomId": getRoomId(),
        }));
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
          let card = state.cards.cardsById[action.cardId];
          animateMoveCard(
            card,
            [0, 0],
            card.zIndex,
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
