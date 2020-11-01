import React from 'react';
import './LobbyComponent.css';
import { CardComponent } from "./CardComponent";
import { Coordinates } from "./store/state";
import { Suit } from "./Suit";
import { words } from "./words/words";

type Props = {
  onJoinRoom: (roomId: string) => {},
}

type State = {
  roomId: string,
  placeholder: string,
  fullPlaceholder: string,
  showTypeMoreMessage: boolean,
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class LobbyComponent extends React.Component<Props, State> {
  private readonly _minimumRoomCodeLength = 14;

  private _showTypeMoreMessageTimeout: NodeJS.Timeout | null = null;

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      roomId: "",
      placeholder: "",
      fullPlaceholder: "",
      showTypeMoreMessage: false,
    }
  }

  private onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    let roomId = event.target.value;
    this.setState({
      roomId: roomId,
    });

    if(this._showTypeMoreMessageTimeout) {
      window.clearTimeout(this._showTypeMoreMessageTimeout);
      this._showTypeMoreMessageTimeout = null;
    }

    if(roomId.length === 0 || roomId.length >= this._minimumRoomCodeLength) {
      this.setState({
        showTypeMoreMessage: false,
      });
    } else {
      this._showTypeMoreMessageTimeout = setTimeout(() => {
        this.setState({
          showTypeMoreMessage: true,
        });
      }, 1500);
    }
  }

  private buttonClick(e: React.MouseEvent<HTMLButtonElement>) {
    let roomId = this.state.roomId;
    if(roomId === "") {
      roomId = this.state.fullPlaceholder;
    }
    window.history.pushState({}, "", `${window.location.origin}/${roomId}`);
    this.props.onJoinRoom(roomId);
  }

  componentDidMount() {
    this.showSampleRoomNames();
  }

  private async showSampleRoomNames() {
    while (true) {
      const numberOfWordsInSampleName = 3;
      let sampleName = words.sort(() => Math.random() - 0.5).slice(0, numberOfWordsInSampleName).join('-');
      this.setState({placeholder: "", fullPlaceholder: sampleName });
      await sleep(300);
      for (let i = 1; i <= sampleName.length; i++) {
        this.setState({placeholder: sampleName.slice(0, i)});
        await sleep(60);
      }
      await sleep(3000);
    }
  }

  private static renderSampleCards(): JSX.Element[] {
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
        selected={false}
        onSelectUnder={() => {}}
        onTurnOver={() => {}}
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
            placeholder={this.state.placeholder}
            onChange={(event) => this.onInputChange(event)}
          />
          <button
            type="submit"
            disabled={this.state.roomId.length > 0 && this.state.roomId.length < this._minimumRoomCodeLength}
            onClick={(e) => this.buttonClick(e)}
          >
            Enter Room
          </button>
          {this.state.showTypeMoreMessage && (<p>
            Choose a longer room code
          </p>)}
        </form>
      </div>
      <div className="lobby-sample-cards">
        {LobbyComponent.renderSampleCards()}
      </div>
    </div>;
  }
}
