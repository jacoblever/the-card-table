import React from 'react';
import './ToolbarComponent.css';
import { ModalComponent } from "./ModalComponent";

type Props = {
  showDealModal: boolean,

  tidy: () => void,
  shuffle: () => void,
  deal: (numberToEachPlayer: number) => void

  openDealModal: () => void,
  closeDealModal: () => void,
}

export function ToolbarComponent(props: Props) {
  let inputRef = React.createRef<HTMLInputElement>();
  let handleDealClick = () => {
    let numberToEachPlayer = +inputRef.current!.value;
    props.deal(numberToEachPlayer);
  };
  return (
    <div className="toolbar">
      <button onClick={() => props.tidy()}>Tidy</button>
      <button onClick={() => props.shuffle()}>Shuffle</button>
      <button onClick={() => props.openDealModal()}>Deal</button>

      {props.showDealModal && (<ModalComponent closable={true} onClose={() => props.closeDealModal()}>
        <h2>Deal Cards</h2>
        <p>Deal this many cards to each player:</p>
        <input ref={inputRef} />
        <button onClick={() => handleDealClick()}>Deal</button>
      </ModalComponent>)}
    </div>
  );
}
