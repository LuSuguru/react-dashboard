import { PositionParams, Position, Size, Bound } from '../type'

export function calcGirdColWidth({ margin, containerPadding, containerWidth, cols }: PositionParams) {
  return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
}

export function calcGirdItemWHPx(girdUnits: number, colOrRowSize: number, marginPx: number) {
  if (!Number.isFinite(girdUnits)) return girdUnits

  return Math.round(colOrRowSize * girdUnits) + Math.max(0, girdUnits - 1) * marginPx
}

export function calcGridItemPosition(positionParams: PositionParams, x: number, y: number, w: number, h: number, state?: { resizing: Size, dragging: Position }) {
  const { margin, containerPadding, rowHeight } = positionParams
  const colWidth = calcGirdColWidth(positionParams)

  const out: Bound = {}

  if (state?.resizing) {
    out.width = Math.round(state.resizing.width)
    out.height = Math.round(state.resizing.height)
  } else {
    out.width = calcGirdItemWHPx(w, colWidth, margin[0])
    out.height = calcGirdItemWHPx(h, rowHeight, margin[1])
  }

  if (state?.dragging) {
    out.top = Math.round(state.dragging.top)
    out.left = Math.round(state.dragging.left)
  } else {
    out.top = Math.round((rowHeight + margin[1]) * y + containerPadding[1])
    out.left = Math.round((colWidth + margin[0] * x) + containerPadding[0])
  }

  return out
}
