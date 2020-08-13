export interface DraggableData {
  node: HTMLElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
}

export interface Position {
  x: number
  y: number
}

export interface PositionOffset {
  x: number | string
  y: number | string
}

export interface BoundRect {
  left: number
  right: number
  top: number
  bottom: number
}

export type Axis = 'both' | 'x' | 'y' | 'none'
