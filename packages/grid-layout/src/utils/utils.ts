import { CSSProperties } from 'react'
import { Bound, Layout, LayoutItem } from '@/type'

export function setTransform({ top, left, width, height }: Bound): CSSProperties {
  const translate = `translate(${left}px,${top}px)`

  return {
    transform: translate,
    WebkitTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}

export function setTopLeft({ top, left, width, height }: Bound): CSSProperties {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}

export function perc(num: number): string {
  return num * 100 + '%'
}

export function cloneLayoutItem(layoutItem: LayoutItem) {
  return {
    w: layoutItem.w,
    h: layoutItem.h,
    x: layoutItem.x,
    y: layoutItem.y,
    i: layoutItem.i,
    minW: layoutItem.minW,
    maxW: layoutItem.maxW,
    minH: layoutItem.minH,
    maxH: layoutItem.maxH,

    moved: !!layoutItem.moved,
    isStatic: !!layoutItem.isStatic,
    isDraggable: !!layoutItem.isDraggable,
    isResizable: !!layoutItem.isResizable,
    isBounded: !!layoutItem.isBounded
  }
}

// 获取整个 layout 区域的下边界
export function getBottom(layout: Layout) {
  let max = 0
  layout.forEach(({ y, h }) => {
    const bottomY = y + h
    if (bottomY > max) {
      max = bottomY
    }
  })

  return max
}

export function getLayoutItem(layout: Layout, i: string) {
  return layout.find(layout => i === layout.i)
}

export function isEqual<T>(oldObj: T, newObj: T) {
  return JSON.stringify(oldObj) === JSON.stringify(newObj)
}
