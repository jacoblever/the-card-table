import React, { CSSProperties } from 'react';

import './CardTableComponent.css';
import { CardContainer } from './CardContainer';
import { Card, Player } from './store/state';
import HandContainer from "./HandContainer";
import OtherPlayerHandContainer from "./OtherPlayerHandContainer";

type CardTableProps = {
  cards: Card[],
  players: Player[],
  me: string,
  
  onMount: () => void,
  onUnmount: () => void,
}

class CardTableComponent extends React.Component<CardTableProps, {}> {
  constructor(props: any) {
    super(props);
    this.state = {}
  }

  componentDidMount(): void {
    this.props.onMount();
  }

  componentWillUnmount(): void {
    this.props.onUnmount();
  }

  private getPlayersInOrderWithMeFirst(): Player[] {
    let players = this.props.players;
    let result = [];
    let index = players.findIndex(x => x.id === this.props.me);
    for (let i = 0; i < players.length; i++) {
      let indexToAdd = (i + index) % players.length;
      result.push(players[indexToAdd]);
    }
    return result;
  }

  private renderOtherPlayers(): JSX.Element[] {
    const playersInOrder = this.getPlayersInOrderWithMeFirst();
    if(playersInOrder.length < 2) {
      return [];
    }
    const tableRect = document.getElementById("card-table")!.getBoundingClientRect();
    const tableWidth = tableRect.width;
    const tableHeight = tableRect.height;
    const elements: JSX.Element[] = [];
    for (let i = 1; i < playersInOrder.length; i++) {
      let playerPositionOnPerimeter = (2*tableHeight + tableWidth) * i/playersInOrder.length;
      let style: CSSProperties = {
        position: "absolute",
      };
      if(playerPositionOnPerimeter <= tableHeight) {
        let marginTop = tableHeight - playerPositionOnPerimeter;
        style.marginTop = `${marginTop}px`;
      } else if (playerPositionOnPerimeter < tableHeight + tableWidth) {
        const proportionAlongTop = (playerPositionOnPerimeter - tableHeight)/tableWidth;
        style.marginLeft = `${proportionAlongTop*100}%`;
      } else {
        let marginTop = playerPositionOnPerimeter - tableHeight - tableWidth;
        style.marginTop = `${marginTop}px`;
        style.right = 0;
      }

      elements.push(
        <div key={i} style={style}>
          <OtherPlayerHandContainer player={playersInOrder[i]} />
        </div>
      );
    }

    return elements;
  }

  private renderCards(): JSX.Element[] {
    const cards = [];
    for (const card of this.props.cards) {
      cards.push(
        <CardContainer
          id={card.id}
          key={card.id}
          movable={true}
        />
      )
    }
    return cards;
  }

  render() {
    return (
      <div className="table" id="card-table">
        {this.renderOtherPlayers()}

        {this.renderCards()}

        <HandContainer player={this.getPlayersInOrderWithMeFirst()[0]} />
      </div>
    );
  }
}

export default CardTableComponent;
