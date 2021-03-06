/**
 * ---- Common data types ----------------------------------------------------
 */

undefined; // dummy code for VSCode to ignore file header

/**
 * Object that has width and height of a rectangle.
 */
export interface RectangleSize {
  readonly width: number;
  readonly height: number;
}

export type ArrayOrValue<T> = T | T[];

export interface MutableRange {
  start: number;
  end: number;
}

export type Range = Readonly<MutableRange>;
