import { CompactType, Layout, LayoutItem } from '@/type'
import { sortLayoutItems } from './sortLayout'
import { getFirstCollision, getAllCollisions } from './collision'

export default function useMoveElement(compactType: CompactType) {
  function moveElementAwayFromCollision(layout: Layout, collidesWith: LayoutItem, itemToMove: LayoutItem, isUserAction: boolean): Layout {
    const preventCollision = collidesWith.isStatic
    const compactH = compactType === 'horizontal'
    const compactV = compactType !== 'horizontal'

    if (isUserAction) {
      isUserAction = false

      // Math.max(collidesWith.y - itemToMove.h)用来判断在垂直方向上，如果碰撞的元素上方有足够的空间放置待移动元素
      // 在垂直方向上，一般发生在元素从上垂直往下移动时
      // 同理，水平方向也一样，一般发生在元素从左往右垂直移动时
      // 我们仅在主要移动中这样做，在级联操作中会引发不必要的交换位置
      const fakeItem: LayoutItem = {
        x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
        y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
        w: itemToMove.w,
        h: itemToMove.h,
        i: '-1'
      }

      // 没有冲突，即有足够的空间容乃
      if (!getFirstCollision(layout, fakeItem)) {
        return moveElement(
          layout,
          itemToMove,
          compactH ? fakeItem.x : undefined,
          compactV ? fakeItem.y : undefined,
          isUserAction,
          preventCollision
        )
      }
    }

    return moveElement(
      layout,
      itemToMove,
      compactH ? itemToMove.x + 1 : undefined,
      compactV ? itemToMove.y + 1 : undefined,
      isUserAction,
      preventCollision
    )
  }

  // 移动元素，防止与其他元素进行碰撞
  function moveElement(layout: Layout, l: LayoutItem, x: number, y: number, isUserAction: boolean, preventCollision: boolean): Layout {
    if (l.isStatic && l.isDraggable !== true) return layout

    if (l.y === y && l.x === x) return layout

    const oldX = l.x
    const oldY = l.y

    if (typeof x === 'number') l.x = x
    if (typeof y === 'number') l.y = y
    l.moved = true

    // 优化，减少移动次数
    let sorted = sortLayoutItems(layout, compactType)
    const movingUp = compactType === 'vertical' && typeof y === 'number'
      ? oldY >= y
      : compactType === 'horizontal' && typeof x === 'number'
        ? oldX >= x
        : false
    // 如果是往上或者是往左移动，需要倒排
    if (movingUp) {
      sorted = [...sorted].reverse()
    }

    const collisions = getAllCollisions(sorted, l)

    if (preventCollision && collisions.length) {
      l.x = oldX
      l.y = oldY
      l.moved = false
      return layout
    }

    for (let i = 0; i < collisions.length; i++) {
      const collision = collisions[i]

      // 如果已经移动过了，直接跳过，避免无限循环
      if (collision.moved) continue

      // 不能移动 static item，我们必须移动当前元素本身
      if (collision.isStatic) {
        layout = moveElementAwayFromCollision(layout, collision, l, isUserAction)
      } else {
        layout = moveElementAwayFromCollision(layout, l, collision, isUserAction)
      }
    }

    return layout
  }

  return moveElement
}
