import React from 'react';
import './ToolbarComponent.css';

type Props = {
  tidy: () => void,
  shuffle: () => void,
}

export function ToolbarComponent(props: Props) {
  return (
    <div className="toolbar">
      <button onClick={() => props.tidy()}>Tidy</button>
      <button onClick={() => props.shuffle()}>Shuffle</button>
    </div>
  );
}
