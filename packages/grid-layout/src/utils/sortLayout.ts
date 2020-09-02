import { Layout, CompactType } from '@/type'

function sortLayoutItemsByRowCol(layout: Layout) {
  return [...layout].sort((a, b) => {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1
    }

    if (a.y === b.y && a.x === b.x) {
      return 0
    }

    return -1
  })
}

function sortLayoutItemsByColRow(layout: Layout) {
  return [...layout].sort((a, b) => {
    if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
      return 1
    }

    return -1
  })
}

export function sortLayoutItems(layout: Layout, compactType: CompactType): Layout {
  if (compactType === 'horizontal') {
    return sortLayoutItemsByColRow(layout)
  }
  return sortLayoutItemsByRowCol(layout)
}
