import { Dispatch, Store } from "redux";
import Cookies from "js-cookie"
import { AppState, CardOwnerTable } from "../store/state";
import { animateMoveCard } from "./animations";
import {
  ActionTypes,
  DROP_CARD,
  INITIAL_CARD_STATE,
  KICK_PLAYER,
  NAME_CHANGE,
  PLAYERS_UPDATE,
  WS_CONNECT,
  WS_DISCONNECT
} from "../store/actions";

function getWebSocketPath(roomId: string) {
  let playerId = Cookies.get(`playerId-${roomId}`) ?? "NewPlayer";
  let playerName = Cookies.get("default-name") ?? "";

  let url = process.env.REACT_APP_BACKEND_WEBSOCKET_URL;
  return `${url}?room-id=${roomId}&player-id=${playerId}&player-name=${playerName}`;
}

const socketMiddleware = () => {
  let socket: WebSocket | null = null;

  const onOpen = (store: Store<AppState, ActionTypes>, roomId: string) => (event: Event) => {
    console.log('websocket open');
    let action = {
      type: "GET_INITIAL_STATE",
    };
    socket!.send(JSON.stringify({
      "message":"sendmessage",
      "data": JSON.stringify(action),
      "roomId": roomId,
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
        animateMoveCard({
          me: currentState.cards.me,
          nowHeldBy: message.nowHeldBy,
          drops: message.drops.map(drop => {
            let card = currentState.cards.cardsById[drop.cardId];
            return {
              card: card,
              endLocation: drop.location,
              finalZIndex: drop.zIndex,
              turnOver: drop.turnOver,
            };
          })
        }, (a: ActionTypes) => store.dispatch(a));
        break;
      case INITIAL_CARD_STATE:
        let roomId = store.getState().roomId;
        Cookies.set(`playerId-${roomId}`, message.state.me)
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
    let roomIdGetter = () => store.getState().roomId!;
    switch (action.type) {
      case WS_CONNECT:
        if (socket !== null) {
          socket.close();
        }

        let roomId = roomIdGetter();
        socket = new WebSocket(getWebSocketPath(roomId));
        socket.onmessage = onMessage(store);
        socket.onclose = onClose(store);
        socket.onopen = onOpen(store, roomId);
        break;
      case WS_DISCONNECT:
        if (socket !== null) {
          socket.close();
        }
        socket = null;
        console.log('websocket closed');
        break;
      case DROP_CARD:
      case NAME_CHANGE:
      case KICK_PLAYER:
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
          "roomId": roomIdGetter(),
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

        animateMoveCard({
          me: state.cards.me,
          nowHeldBy: action.nowHeldBy,
          drops: action.drops.map(drop => {
            let card = state.cards.cardsById[drop.cardId];
            return {
              card: card,
              endLocation: [0, 0],
              finalZIndex: card.zIndex,
              turnOver: false,
            };
          })
        }, (a: ActionTypes) => store.dispatch(a));
      }
    }
  };
};

export default socketMiddleware();
