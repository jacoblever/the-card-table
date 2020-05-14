import { CardOwner, CardOwnerTable, Location } from "../store/state";

export class LocationTransformer {
  private readonly _location: Location;
  private readonly _reference: HTMLElement;

  constructor(location: Location, owner: CardOwner) {
    this._location = location;
    this._reference = this.getElement(owner);
  }

  private getElement(owner: CardOwner): HTMLElement {
    if (owner === CardOwnerTable) {
      return document.getElementById("card-table")!;
    } else {
      return document.getElementById(owner)!;
    }
  }

  public transformTo(newOwner: CardOwner): Location {
    console.log(this._reference);
    let originalReferenceRect = this._reference.getBoundingClientRect();
    let newReferenceRect = this.getElement(newOwner).getBoundingClientRect();
    return [
      originalReferenceRect.left - newReferenceRect.left + this._location[0],
      originalReferenceRect.top - newReferenceRect.top + this._location[1],
    ];
  }
}
