import React from 'react';
import './LobbyComponent.css';
import { CardComponent } from "./CardComponent";
import { Coordinates } from "./store/state";
import { Suit } from "./Suit";

type LobbyProps = {
  onJoinRoom: (roomId: string) => {},
}

type LobbyState = {
  roomId: string,
}

export class LobbyComponent extends React.Component<LobbyProps, LobbyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      roomId: "",
    }
  }

  private buttonClick(e: React.MouseEvent<HTMLButtonElement>) {
    window.history.pushState({}, "", `${window.location.origin}/${this.state.roomId}`);
    this.props.onJoinRoom(this.state.roomId);
  }

  private renderSampleCards(): JSX.Element[] {
    let cardProps = [
      {
        id: "sample-1",
        location: [40, 30] as Coordinates,
        suit: Suit.Spades,
        number: 1,
        faceUp: false,
      },
      {
        id: "sample-2",
        location: [120, 30] as Coordinates,
        suit: Suit.Diamonds,
        number: 13,
        faceUp: true,
      },
      {
        id: "sample-2",
        location: [140, 50] as Coordinates,
        suit: Suit.Spades,
        number: 1,
        faceUp: true,
      }
    ];

    return cardProps.map<JSX.Element>(x => {
      return <CardComponent
        id={x.id}
        location={x.location}
        suit={x.suit}
        number={x.number}
        heldBy={null}
        faceUp={x.faceUp}
        zIndex={1}
        movable={false}
        onClick={() => {}}
        onPickUp={() => {}}
        onMove={() => {}}
        onDrop={() => {}}
      />
    })
  }

  render() {
    return <div className="lobby">
      <div className="lobby-welcome">
        <h1>
          The Card Room
        </h1>
        <p>
          Play cards remotely with your friends
        </p>
        <p>
          To create a new room or join an existing room, enter a room code.
        </p>
        <form>
          <input
            type="text"
            value={this.state.roomId}
            onChange={event => this.setState({roomId: event.target.value})}
          />
          <button
            type="submit"
            disabled={this.state.roomId === ""}
            onClick={(e) => this.buttonClick(e)}
          >
            Enter Room
          </button>
        </form>
      </div>
      <div className="lobby-sample-cards">
        {this.renderSampleCards()}
      </div>
    </div>;
  }
}
