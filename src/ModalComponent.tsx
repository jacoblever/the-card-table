import React from 'react';

import './ModalComponent.css';

export type Props = {
  closable: boolean
  onClose?: () => void,
  onEnterClick?: () => void,
}

export class ModalComponent extends React.Component<Props, {}> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {}
  }

  private handleBackgroundClick(event: React.MouseEvent<HTMLDivElement>) {
    if(!this.props.closable) {
      return;
    }
    if((event.target as Element).closest(".modal-content")) {
      return;
    }
    if(this.props.onClose) {
      this.props.onClose();
    }
  }

  private handleCloseClick(event: React.MouseEvent<HTMLButtonElement>) {
    if(!this.props.closable) {
      return;
    }
    if(this.props.onClose) {
      this.props.onClose();
    }
  }

  private handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    if(!this.props.closable) {
      return;
    }
    let escapeKeyCode = 27;
    if(event.keyCode === escapeKeyCode && this.props.onClose) {
      this.props.onClose();
    }

    let enterKeyCode = 13;
    if(event.keyCode === enterKeyCode && this.props.onEnterClick) {
      this.props.onEnterClick();
    }
  }

  private renderCloseButton(): JSX.Element | null {
    if (this.props.closable) {
      return <button className="modal-close" onClick={(e) => this.handleCloseClick(e)}>&times;</button>
    }
    return null;
  }

  render() {
    return (
      <div
        className="modal"
        onClick={(e) => this.handleBackgroundClick(e)}
        onKeyUp={(e) => this.handleKeyUp(e)}
      >
        <div className="modal-content">
          {this.renderCloseButton()}
          {this.props.children}
        </div>
      </div>
    );
  }
}
