import { Breakpoint, Breakpoints, CompactType, ResponsiveLayout } from '@/type'

import { compact, correctBounds } from './collision'
import { cloneLayout } from './utils'

// 将 breakpoionts 按从小到大排列
function sortBreakpoints(breakpoints: Breakpoints) {
  const keys = Object.keys(breakpoints)
  return keys.sort((a, b) => breakpoints[a] - breakpoints[b]) as Breakpoint[]
}

// 小于传入宽度的 最大的 breakpoint
export function getBreakpointFormWidth(breakpoints: Breakpoints, width: number) {
  const sorted = sortBreakpoints(breakpoints)

  let matching = sorted[0]

  sorted.forEach((breakpointName) => {
    if (width > breakpoints[breakpointName]) {
      matching = breakpointName
    }
  })

  return matching
}

export function getColsFromBreakpoint(breakpoint: Breakpoint, cols: Breakpoints) {
  if (!cols[breakpoint]) {
    throw new Error(`ResponsiveGridLayout: 'cols' entry for breakpoint ${breakpoint} is missing!`)
  }

  return cols[breakpoint]
}

// 提供一个现有的 layouts 和一个新的 breakpoint，查找或者生成一个新的 layout
export function findOrGenerateResponsiveLayout(layouts: ResponsiveLayout, breakpoints: Breakpoints, breakpoint: Breakpoint, lastBreakpoint: Breakpoint, cols: number, compactType: CompactType) {
  if (layouts[breakpoint]) {
    return cloneLayout(layouts[breakpoint])
  }

  let layout = layouts[lastBreakpoint]
  const breakpointsSorted = sortBreakpoints(breakpoints)
  const breakpointsAbove = breakpointsSorted.slice(breakpointsSorted.indexOf(breakpoint))

  for (let i = 0, { length } = breakpointsAbove; i < length; i++) {
    const b = breakpointsAbove[i]

    if (layouts[b]) {
      layout = layouts[b]
      break
    }
  }

  layout = cloneLayout(layout || [])
  return compact(correctBounds(layout, cols), compactType, cols)
}
