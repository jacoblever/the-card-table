import { Coordinates } from "../store/state";

export class Elementwise {
  public static map(map: (i: 0 | 1) => number): Coordinates {
    let indexes: (0 | 1)[] = [0, 1];
    let array = indexes.map(x => map(x));
    return array as Coordinates;
  }
}
