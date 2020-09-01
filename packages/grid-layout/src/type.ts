import { MouseEvent } from 'react'

export interface PositionParams {
  cols: number
  containerWidth: number
  rowHeight: number
  maxRows: number
  margin: [number, number] // 宽，长
  containerPadding: [number, number] // 宽、长
}

export interface Position {
  top: number
  left: number
}

export interface Size {
  width: number
  height: number
}

export type Bound = Partial<Position & Size>

export interface GirdResizeEvent {
  e: MouseEvent<HTMLElement>
  node: HTMLElement
  size: Size
}

export interface GirdDraggEvent {
  e: MouseEvent<HTMLElement>
  node: HTMLElement
  newPosition: Position
}

export type GridItemCallback<Data> = (
  i: string,
  w: number,
  h: number,
  data: Data
) => void
