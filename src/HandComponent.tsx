import React, { KeyboardEvent } from 'react';

import interact from 'interactjs'
import '@interactjs/types'
import Cookies from "js-cookie";

import './HandComponent.css';
import EditIcon from './icons/EditIcon.svg';
import ArrangeIcon from './icons/ArrangeIcon.svg';
import ViewIcon from './icons/ViewIcon.svg';
import RefreshIcon from './icons/RefreshIcon.svg';
import { Card, Player } from "./store/state";
import { CardContainer } from "./CardContainer";
import { ModalComponent } from "./ModalComponent";

type Props = {
  player: Player,
  cards: Card[],

  changeName: (name: string) => {},
  arrangeHand: (handWidth: number) => void,
  faceUpHand: () => void,
  regatherAllCards: () => void,
}

type State = {
  editMode: boolean,
  editedName: string,

  regatherModalOpen: boolean,
}

export class HandComponent extends React.Component<Props, State> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      editMode: false,
      editedName: this.props.player?.name,

      regatherModalOpen: false,
    }
  }

  componentDidMount() {
    interact(this.domElement.current!)
      .dropzone({
        accept: '.card',
        overlap: 0.5,
        // When a card is picked up (wherever it is)
        ondropactivate: function (event) {
          let handDomElement = event.target;

          handDomElement.classList.add('drop-active');
        },
        // When a card is dragged over the hand
        ondragenter: function (event) {
          let handDomElement = event.target;
          let cardDomElement = event.relatedTarget;

          handDomElement.classList.add('drop-target')
          cardDomElement.classList.add('can-drop')
        },
        // When a card is dragged out of the hand
        ondragleave: function (event) {
          let handDomElement = event.target;
          let cardDomElement = event.relatedTarget;

          handDomElement.classList.remove('drop-target')
          cardDomElement.classList.remove('can-drop')
        },
        // When a card is dropped in the hand
        ondrop: function (event) {

        },
        // When a card is dropped (wherever it is)
        ondropdeactivate: function (event) {
          let handDomElement = event.target;

          handDomElement.classList.remove('drop-active')
          handDomElement.classList.remove('drop-target')
        }
      });
  }

  private changeName() {
    let newName = this.state.editedName;
    if(newName === "") {
      return;
    }
    this.setState({editMode: false});
    Cookies.set("default-name", newName, {
      expires: new Date(new Date().setFullYear(2100)),
    });
    if(newName !== this.props.player.name) {
      this.props.changeName(newName);
    }
  }

  private renderName(): JSX.Element {
    let className = "hand-container__name";
    if(!this.props.player) {
      return <span className={className}/>
    }
    let title = <span className="hand-container__name-label">Your nickname:&nbsp;</span>;
    if(this.state.editMode) {
      let onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if(event.keyCode === 13) { // enter
          this.changeName();
        }
      };
      return <span className={className}>
        {title}
        <input
          type="text"
          value={this.state.editedName}
          autoFocus={true}
          onChange={(event) => this.setState({editedName: event.target.value})}
          onKeyUp={onKeyUp}
          onBlur={(event => this.changeName())}
        />
      </span>
    }
    let startEditMode = () => this.setState({
      editMode: true,
      editedName: this.props.player.name,
    });
    return <span className={className}>
      {title}
      {this.props.player.name}
      &nbsp;
      <img src={EditIcon} width="15px" onClick={startEditMode} alt="Edit" title="Edit Nickname"/>
    </span>
  }

  private getHandWidth(): number {
    const rect = this.domElement.current!.getBoundingClientRect();
    return rect.width;
  }

  private renderButtons(): JSX.Element {
    let className = "hand-container__buttons";
    return <span className={className}>
      <img
        src={ArrangeIcon}
        width="37px"
        onClick={() => this.props.arrangeHand(this.getHandWidth())}
        alt="Arrange"
        title="Arrange your hand"
      />
      <img
        src={ViewIcon}
        width="37px"
        onClick={() => this.props.faceUpHand()}
        alt="View"
        title="View your cards (privately)"
      />
    </span>;
  }

  private renderTools() {
    let close = () => this.setState({regatherModalOpen: false});
    let confirm = () => {
      close();
      this.props.regatherAllCards();
    };
    return <div className="hand-container__tools">
      <img
        src={RefreshIcon}
        width="25px"
        onClick={() => this.setState({regatherModalOpen: true})}
        alt="Gather the cards together for a new game"
        title="Gather the cards together for a new game"
      />
      {this.state.regatherModalOpen && (<ModalComponent closable={true} onClose={close} onEnterClick={confirm}>
        <h2>Gather all cards</h2>
        <p>Gather all the cards together (from everyone's hands) back on the table for a new game</p>
        <p><i>(This cannot be undone and will ruin the current game!)</i></p>

        <button onClick={close}>
          Cancel
        </button>
        <button onClick={confirm}>
          OK
        </button>
      </ModalComponent>)}
    </div>;
  }

  render() {
    return (
      <div className="hand-container">
        {this.renderTools()}
        <div id={this.props.player?.id} className="hand" ref={this.domElement}>
          {this.props.cards.map(card =>
            <CardContainer
              id={card.id}
              key={card.id}
              movable={true}
            />
          )}
          {this.renderName()}
          {this.renderButtons()}
        </div>
      </div>
    );
  }
}
