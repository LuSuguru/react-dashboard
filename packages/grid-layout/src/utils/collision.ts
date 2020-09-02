import { Layout, LayoutItem, CompactType } from '@/type'
import { getBottom, cloneLayoutItem } from './utils'
import { sortLayoutItems } from './sortLayout'

// 判断两个元素是否碰撞
function isCollides(l1: LayoutItem, l2: LayoutItem) {
  if (l1.i === l2.i) return false
  if (l1.x + l1.w <= l2.x) return false // l1 在 l2 前面
  if (l1.x >= l2.x + l2.w) return false // l1 在 l2 后面
  if (l1.y + l1.h <= l2.y) return false // l1 在 l2 上面
  if (l1.y >= l2.y + l2.h) return false // l1 在 里 x下面

  return true
}

// 获取第一个碰撞的元素
function getFirstCollision(layout: Layout, layoutItem: LayoutItem) {
  return layout.find(l => isCollides(l, layoutItem))
}

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
    // 满足未与比较过的 item 碰撞的前提下让 item 尽可能地往上，
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--
    }
  } else {
    // 满足未与比较过的 item 碰撞的前提下让 item 尽可能地往左
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
    // 超过右边边界
    if (l.x + l.w > cols) {
      l.x = cols - l.w
    }

    // 超过左边边界
    if (l.x < 0) {
      l.x = 0
      l.w = cols
    }

    if (!l.isStatic) {
      collidesWith.push(l)
    } else {
      // 如果与其他 item 有碰撞，则往下移动
      while (getFirstCollision(collidesWith, l)) {
        l.y++
      }
    }
  })

  return layout
}
