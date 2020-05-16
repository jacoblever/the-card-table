import { CardOwner, CardOwnerTable, Coordinates } from "../store/state";
import { Elementwise } from "./elementwise";

export class LocationTransformer {
  private readonly _location: Coordinates;
  private readonly _owner: CardOwner;

  constructor(location: Coordinates, owner: CardOwner) {
    this._location = location;
    this._owner = owner;
  }

  private getElement(owner: CardOwner): HTMLElement {
    if (owner === CardOwnerTable) {
      return document.getElementById("card-table")!;
    } else {
      return document.getElementById(owner)!;
    }
  }

  public transformTo(newOwner: CardOwner): Coordinates {
    if(this._owner === newOwner) {
      return this._location;
    }

    let originalReferenceRect = this.getElement(this._owner).getBoundingClientRect();
    let newReferenceRect = this.getElement(newOwner).getBoundingClientRect();

    let originalReferenceFrameOrigin = [originalReferenceRect.left, originalReferenceRect.top];
    let newReferenceFrameOrigin = [newReferenceRect.left, newReferenceRect.top];

    return Elementwise.map(i => {
      return this._location[i] + originalReferenceFrameOrigin[i] - newReferenceFrameOrigin[i];
    });
  }
}
