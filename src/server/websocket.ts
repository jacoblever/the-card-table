import { Dispatch, Store } from "redux";
import Cookies from "js-cookie"
import { AppState, CardOwnerTable } from "../store/state";
import { animateDropCard } from "./animations";
import {
  AppAction, AppThunkDispatch
} from "../store/actions/actions";
import { WS_CONNECT, WS_DISCONNECT, wsDisconnected } from "../store/actions/websocket_actions";
import { DROP_CARDS, dropCards, INITIAL_CARD_STATE } from "../store/actions/card_actions";
import { KICK_PLAYER, NAME_CHANGE, PLAYERS_UPDATE } from "../store/actions/player_actions";

function getWebSocketPath(roomId: string) {
  let playerId = Cookies.get(`playerId-${roomId}`) ?? "NewPlayer";
  let playerName = Cookies.get("default-name") ?? "";

  let url = process.env.REACT_APP_BACKEND_WEBSOCKET_URL;
  return `${url}?room-id=${roomId}&player-id=${playerId}&player-name=${playerName}`;
}

const socketMiddleware = () => {
  let socket: WebSocket | null = null;

  const onOpen = (store: Store<AppState, AppAction>, roomId: string) => (event: Event) => {
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

  const onClose = (store: Store<AppState, AppAction>) => (event: CloseEvent) => {
    console.log('websocket closed');
    store.dispatch(wsDisconnected());
  };

  const onMessage = (store: Store<AppState, AppAction>) => (event: MessageEvent) => {
    let message = JSON.parse(event.data) as AppAction;
    switch (message.type) {
      case DROP_CARDS:
        let thunkDispatch = store.dispatch as AppThunkDispatch;
        thunkDispatch(animateDropCard(message));
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

  return (store: Store<AppState, AppAction>) => (next: Dispatch<AppAction>) => (action: AppAction) => {
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
      case DROP_CARDS:
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

    if(action.type === DROP_CARDS && !action.remote) {
      let state = store.getState();
      let droppedToOtherPlayer = action.nowHeldBy !== CardOwnerTable && action.nowHeldBy !== state.room.me;
      if(droppedToOtherPlayer) {
        let thunkDispatch = store.dispatch as AppThunkDispatch;
        thunkDispatch(animateDropCard(
          dropCards(
            action.nowHeldBy,
            action.drops.map(drop => {
              let card = state.room.cardsById[drop.cardId];
              return {
                cardId: card.id,
                location: [0, 0],
                zIndex: card.zIndex,
                turnOver: false,
              };
            }),
            true,
          ),
        ));
      }
    }
  };
};

export default socketMiddleware();
