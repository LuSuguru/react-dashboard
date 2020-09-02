import { CSSProperties, ReactChild, ReactElement, Children } from 'react'
import { Bound, Layout, CompactType, LayoutItem } from '@/type'
import { sortLayoutItems } from './sortLayout'

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

// 判断两个元素是否碰撞
function isCollides(l1: LayoutItem, l2: LayoutItem) {
  if (l1.i === l2.i) return false
  if (l1.x + l1.w <= l2.x) return false
  if (l1.x >= l2.x + l2.w) return false
  if (l1.y + l1.h <= l2.y) return false
  if (l1.y >= l2.y + l2.h) return false

  return true
}

// 获取第一个碰撞的元素
const getFirstCollision = (layout: Layout, layoutItem: LayoutItem) => layout.find(l => isCollides(l, layoutItem))

function resolveCompactionCollision(layout: Layout, item: LayoutItem, movetoCoord: number, axis: 'x' | 'y') {
  const sizeMap = { x: 'w', y: 'h' }
  const sizeProp = sizeMap[axis]

  item[axis] += 1
  const itemIndex = layout.map(({ i }) => i).indexOf(item.i)

  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i]

    // 静态 item 直接跳过
    if (otherItem.isStatic) continue
    // 优化：排过序的 list ,我们可以尽早跳过
    if (otherItem.y > item.y + item.h) break

    if (isCollides(item, otherItem)) {
      resolveCompactionCollision(layout, otherItem, movetoCoord + item[sizeProp], axis)
    }
  }
  item[axis] = movetoCoord
}

function compactItem(compareWith: Layout, l: LayoutItem, compactType: CompactType, cols: number, sortedLayout: Layout) {
  l.y = Math.min(getBottom(compareWith), l.y)

  if (compactType === 'vertical') {
    // 满足未与 static 的 item 碰撞的前提下让 item 尽可能的往上，
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--
    }
  } else {
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--
    }
  }

  let collides: LayoutItem
  while (collides = getFirstCollision(compareWith, l)) {
    if (compactType === 'horizontal') {
      resolveCompactionCollision(sortedLayout, l, collides.x + collides.w, 'x')
    } else {
      resolveCompactionCollision(sortedLayout, l, collides.y + collides.h, 'y')
    }

    if (compactType === 'horizontal' && l.x + l.w > cols) {
      l.x = cols - l.w
      l.y++
    }
  }

  return l
}

export function compact(layout: Layout, compactType: CompactType, cols: number): Layout {
  const compareWith = layout.filter(i => i.isStatic)
  const sorted = sortLayoutItems(layout, compactType)

  const out = new Array(layout.length)

  sorted.forEach((item) => {
    let newLayoutItem: LayoutItem = cloneLayoutItem(item)

    if (!newLayoutItem.isStatic) {
      newLayoutItem = compactItem(compareWith, newLayoutItem, compactType, cols, sorted)
      compareWith.push(newLayoutItem)
    }

    out[layout.indexOf(item)] = newLayoutItem

    newLayoutItem.moved = false
  })
  return out
}

// 收集 静态的 和碰撞到边的 item
export function correctBounds(layout: Layout, { cols }: { cols: number }): Layout {
  const collidesWith = layout.filter(i => i.isStatic)

  layout.forEach(l => {
    // 超过右边
    if (l.x + l.w > cols) {
      l.x = cols - l.w
    }

    // 超过左边
    if (l.x < 0) {
      l.x = 0
      l.w = cols
    }

    if (!l.isStatic) {
      collidesWith.push(l)
    } else {
      while (getFirstCollision(collidesWith, l)) {
        l.y++
      }
    }
  })

  return layout
}

// 同步 layout
export function syncLayoutWithChildren(initialLayout: Layout = [], children: ReactChild, cols: number, compactType: CompactType): Layout {
  const layout: LayoutItem[] = []

  Children.forEach(children, (child: ReactElement, index: number) => {
    const exists = initialLayout.find(({ i }) => i === child.key + '')

    if (exists) {
      layout[index] = cloneLayoutItem(exists)
    } else {
      const grid = child.props['data-grid']

      if (grid) {
        layout[index] = cloneLayoutItem({ ...grid, i: child.key })
      } else {
        layout[index] = cloneLayoutItem({
          w: 1,
          h: 1,
          x: 0,
          y: getBottom(layout),
          i: child.key + ''
        })
      }
    }
  })

  const correctedLayout = correctBounds(layout, { cols })
  return compact(correctedLayout, compactType, cols)
}
