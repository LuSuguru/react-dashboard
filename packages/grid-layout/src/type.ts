import { MouseEvent, DragEvent } from 'react'
import { Direction } from 'resizable/es/type'

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

  resizeHanldes?: Direction[]
}

export type Layout = readonly LayoutItem[]

export type CompactType = 'horizontal' | 'vertical'

export type EventCallbck = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent<HTMLElement>, node: HTMLElement) => void

export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs'

export type Breakpoints = {
  [key in Breakpoint]?: number
}

export type ResponsiveLayout = {
  [key in Breakpoint]?: Layout
}

export type ResponsiveMargin = { [key in Breakpoint]?: [number, number] } | [number, number]
