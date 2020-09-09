import { MouseEvent, DragEvent } from 'react'

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

export interface DroppingPosition extends Position {
  e: DragEvent
}

export type Bound = Partial<Position & Size>

export interface GridResizeEvent {
  e: MouseEvent<HTMLElement>
  node: HTMLElement
  size: Size
}

export interface GridDraggEvent {
  e: MouseEvent<HTMLElement>
  node: HTMLElement
  newPosition: Position
}

export type GridItemCallback<Data> = (i: string, w: number, h: number, data: Data) => void

export interface LayoutItem {
  w: number
  h: number
  x: number
  y: number
  i: string

  minW?: number
  minH?: number
  maxW?: number
  maxH?: number

  moved?: boolean
  isStatic?: boolean
  isDraggable?: boolean
  isResizable?: boolean
  isBounded?: boolean
}

export type Layout = readonly LayoutItem[]

export type CompactType = 'horizontal' | 'vertical'
