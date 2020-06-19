import { Player } from "../state";
import { AppAction} from "../actions/actions";
import { INITIAL_CARD_STATE } from "../actions/card_actions";
import { NAME_CHANGE, PLAYERS_UPDATE } from "../actions/player_actions";

export function PlayersReducer(
  state: Player[] = [],
  action: AppAction,
): Player[] {
  switch (action.type) {
    case INITIAL_CARD_STATE:
      return action.state.players;
    case PLAYERS_UPDATE:
      return action.players
    case NAME_CHANGE:
      let players = [...state];
      let player = players.filter(x => x.id === action.playerId)[0];
      player.name = action.name;
      return players;
    default:
      return state;
  }
}
