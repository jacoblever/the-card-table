import React, { KeyboardEvent } from 'react';

import interact from 'interactjs'
import '@interactjs/types'
import Cookies from "js-cookie";

import './HandComponent.css';
import EditIcon from './icons/EditIcon.svg'
import { Card, Player } from "./store/state";
import { CardContainer } from "./CardContainer";

type Props = {
  player: Player,
  cards: Card[],

  changeName: (name: string) => {};
}

type State = {
  editMode: boolean,
  editedName: string,
}

export class HandComponent extends React.Component<Props, State> {
  private domElement: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    this.state = {
      editMode: false,
      editedName: this.props.player?.name,
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
    if(this.state.editMode) {
      let onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if(event.keyCode === 13) { // enter
          this.changeName();
        }
      };
      return <span className={className}>
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
      {this.props.player.name}
      <img src={EditIcon} width="15px" onClick={startEditMode} alt="Edit"/>
    </span>
  }

  render() {
    return (
      <div className="hand-container">
        <div id={this.props.player?.id} className="hand" ref={this.domElement}>
          {this.props.cards.map(card =>
            <CardContainer
              id={card.id}
              key={card.id}
              movable={true}
            />
          )}
          {this.renderName()}
        </div>
      </div>
    );
  }
}
