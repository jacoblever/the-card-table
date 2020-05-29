import React from 'react';

import './CardTableComponent.css';
import { CardContainer } from './CardContainer';
import { Card } from './store/state';
import HandContainer from "./HandContainer";
import OtherPlayerHandContainer from "./OtherPlayerHandContainer";

type CardTableProps = {
  cards: Card[],
  players: string[],
  me: string,
  
  onMount: () => void,
  onUnmount: () => void,
}

class CardTableComponent extends React.Component<CardTableProps, {}> {
  constructor(props: any) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    this.props.onMount();
  }

  componentWillUnmount() {
    this.props.onUnmount();
  }

  private getPlayersInOrderWithMeFirst(): string[] {
    let players = this.props.players;
    let result = [];
    let index = players.findIndex(x => x === this.props.me);
    for (let i = 0; i < players.length; i++) {
      let indexToAdd = (i + index) % players.length;
      result.push(players[indexToAdd]);
    }
    return result;
  }

  render() {
    const cards = []

    for (const card of this.props.cards) {
      cards.push(
        <CardContainer
          id={card.id}
          key={card.id}
          movable={true}
        />
      )
    }

    let playersInOrder = this.getPlayersInOrderWithMeFirst();
    return (
      <div className="table" id="card-table">
        {playersInOrder[1] && (
          <div style={{float: "left"}}>
            <OtherPlayerHandContainer playerId={playersInOrder[1]} />
          </div>
        )}

        {playersInOrder[2] && (
          <div style={{float: "right"}}>
            <OtherPlayerHandContainer playerId={playersInOrder[2]} />
          </div>
        )}

        {cards}
        <HandContainer playerId={playersInOrder[0]} />
      </div>
    );
  }
}

export default CardTableComponent;
