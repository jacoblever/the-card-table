import React from 'react';
import './ToolbarComponent.css';
import { ModalComponent } from "./ModalComponent";

type Props = {
  showDealModal: boolean,
  defaultNumberToEachPlayer: number,

  tidy: () => void,
  shuffle: () => void,
  deal: (numberToEachPlayer: number) => void,

  openDealModal: () => void,
  closeDealModal: () => void,
}

type State = {
  numberToEachPlayer: number,
}

export class ToolbarComponent extends React.Component<Props, State>{
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      numberToEachPlayer: props.defaultNumberToEachPlayer
    }
  }

  private handleDealClick() {
    this.props.deal(this.state.numberToEachPlayer);
  }

  render() {
    return (
      <div className="toolbar">
        <button onClick={() => this.props.tidy()}>Tidy</button>
        <button onClick={() => this.props.shuffle()}>Shuffle</button>
        <button onClick={() => this.props.openDealModal()}>Deal</button>

        {this.props.showDealModal && (<ModalComponent closable={true} onClose={() => this.props.closeDealModal()}>
          <h2>Deal Cards</h2>
          <p>Deal this many cards to each player:</p>
          <input
            value={this.state.numberToEachPlayer}
            onChange={(e) => this.setState({numberToEachPlayer: +e.target.value})}
          />
          <button onClick={() => this.handleDealClick()}>Deal</button>
        </ModalComponent>)}
      </div>
    );
  }
}
