import { PositionParams, Position, Size, Bound } from '../type'

// 计算每一个 gird col 的 width
export function calcGirdColWidth({ margin, containerPadding, containerWidth, cols }: PositionParams) {
  return (containerWidth - margin[0] * (cols - 1) - containerPadding[0] * 2) / cols
}

// 通过 w,h 获得每一个 gitd 的具体 width,height
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

export function clacWH(positionParams: PositionParams, width: number, height: number, x: number, y: number) {
  const { margin, maxRows, cols, rowHeight } = positionParams
  const colWidth = calcGirdColWidth(positionParams)

  // width = colWidth * w + margin * (w - 1) => w = (width + margin) / (colwidth + margin)
  let w = Math.round((width + margin[0]) / (colWidth + margin[0]))
  let h = Math.round((height + margin[1]) / (rowHeight + margin[1]))

  // 限制 w,h 的范围
  w = clamp(w, 0, cols - x)
  h = clamp(h, 0, maxRows - y)

  return { w, h }
}

export function clacXY(positionParams: PositionParams, top: number, left: number, w: number, h: number) {
  const { margin, cols, rowHeight, maxRows } = positionParams
  const colWidth = calcGirdColWidth(positionParams)

  // left = colWidth * x + margin * (x + 1) => x = (left - margin) / (colWidth + margin)
  let x = Math.round((left - margin[0]) / (colWidth + margin[0]))
  let y = Math.round((top - margin[0]) / (rowHeight + margin[1]))

  x = clamp(x, 0, cols - w)
  y = clamp(y, 0, maxRows - h)

  return { x, y }
}

export function clamp(num: number, lowerBound: number, upperBound: number) {
  return Math.max(Math.min(num, upperBound), lowerBound)
}
