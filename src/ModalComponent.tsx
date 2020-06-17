import React from 'react';

import './ModalComponent.css';

export type Props = {
  closable: boolean
  onClose?: () => void,
}

type State = {
}

export class ModalComponent extends React.Component<Props, State> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  
  constructor(props: any) {
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

  private renderCloseButton(): JSX.Element | null {
    if (this.props.closable) {
      return <button className="modal-close" onClick={(e) => this.handleCloseClick(e)}>&times;</button>
    }
    return null;
  }

  render() {
    return (
      <div className="modal" onClick={(e) => this.handleBackgroundClick(e)}>
        <div className="modal-content">
          {this.renderCloseButton()}
          {this.props.children}
        </div>
      </div>
    );
  }
}
