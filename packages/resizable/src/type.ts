export type Axis = 'both' | 'x' | 'y' | 'none'
export type Direction = 's' | 'w' | 'e' | 'n' | 'sw' | 'se' | 'nw' | 'ne'

export interface ResizeData {
  node: HTMLElement
  size: {
    width: number
    height: number
  }
  direction: Direction
}
