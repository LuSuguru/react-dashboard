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
