import React from 'react';
import './ToolbarComponent.css';
import { ModalComponent } from "./ModalComponent";
import { Coordinates } from "./store/state";

type Props = {
  location: Coordinates,
  showDealModal: boolean,
  defaultNumberToEachPlayer: number,

  tidy: () => void,
  shuffle: () => void,
  deal: (numberToEachPlayer: number) => void,

  openDealModal: () => void,
  closeDealModal: () => void,
}

type State = {
  numberToEachPlayer: string,
}

export class ToolbarComponent extends React.Component<Props, State>{
  private readonly enterKeyCode = 13;

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      numberToEachPlayer: `${props.defaultNumberToEachPlayer}`
    }
  }

  private handleDealClick() {
    if(this.state.numberToEachPlayer === ""){
      return;
    }
    this.props.deal(+this.state.numberToEachPlayer);
  }

  render() {
    return (
      <div className="toolbar" style={{left: this.props.location[0], top: this.props.location[1]}}>
        <button onClick={() => this.props.tidy()}>Tidy</button>
        <button onClick={() => this.props.shuffle()}>Shuffle</button>
        <button onClick={() => this.props.openDealModal()}>Deal</button>

        {this.props.showDealModal && (<ModalComponent closable={true} onClose={() => this.props.closeDealModal()}>
          <h2>Deal Cards</h2>
          <p>Deal this many cards to each player:</p>
          <input
            autoFocus={true}
            type="number"
            value={this.state.numberToEachPlayer}
            onChange={e => this.setState({numberToEachPlayer: e.target.value})}
            onKeyUp={e => e.keyCode === this.enterKeyCode && this.handleDealClick()}
          />
          <button
            disabled={this.state.numberToEachPlayer === ""}
            onClick={() => this.handleDealClick()}
          >
            Deal
          </button>
        </ModalComponent>)}
      </div>
    );
  }
}
