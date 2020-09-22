import React, { memo, FC, useEffect } from 'react'
import isEqual from 'lodash/isEqual'

import { Breakpoint, Breakpoints, ResponsiveLayout, ResponsiveMargin, Layout } from '../type'
import { findOrGenerateResponsiveLayout, getBreakpointFormWidth, getColsFromBreakpoint } from '../utils/responsive'
import { useStates, usePersistFn, usePrevious, useUpdateEffect } from '../hooks'
import GridLayout, { GridLayoutProps, syncLayoutWithChildren } from './GridLayout'
import { cloneLayout } from '@/utils/utils'

function getIndentationValue(param: ResponsiveMargin, breakpoint: Breakpoint) {
  return Array.isArray(param) ? param : param[breakpoint]
}

interface ResponsiveGirdLayoutProps extends Omit<GridLayoutProps, 'cols' | 'layout' | 'margin' | 'containerPadding' | 'width' | 'onLayoutChange'> {
  layouts: ResponsiveLayout
  breakpoints?: Breakpoints
  cols?: Breakpoints
  width: number
  margin?: ResponsiveMargin
  containerPadding?: ResponsiveMargin
  onBreakpointChange: (breakpoint: Breakpoint, cols: number) => void
  onLayoutChange: (layout: Layout, layouts: ResponsiveLayout) => void
  onWidthChange: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number] | null) => void
}

interface State {
  layout: Layout
  breakpoint: Breakpoint
  cols: number
}

const initialState: State = {
  layout: [],
  breakpoint: 'lg',
  cols: 12
}

const ResponsiveGirdLayout: FC<ResponsiveGirdLayoutProps> = (props) => {
  function generateInitialState(): State {
    const { width, breakpoints, layouts, cols, vertialCompact } = props

    const breakpoint = getBreakpointFormWidth(breakpoints, width)
    const colNo = getColsFromBreakpoint(breakpoint, cols)
    const compactType = vertialCompact === false ? null : props.compactType

    const initialLayout = findOrGenerateResponsiveLayout(layouts, breakpoints, breakpoint, breakpoint, colNo, compactType)

    return {
      layout: initialLayout,
      cols: colNo,
      breakpoint
    }
  }

  const [state, setState] = useStates(initialState, generateInitialState)
  const prevProps = usePrevious(props)
  const prevState = usePrevious(state)

  useEffect(() => {
    onWidthChange()
  }, [props.width, JSON.stringify(props.breakpoints), JSON.stringify(props.cols)])

  useUpdateEffect(() => {
    if (!isEqual(prevProps.layouts, props.layouts)) {
      const newLayout = findOrGenerateResponsiveLayout(
        props.layouts,
        props.breakpoints,
        prevState.breakpoint,
        prevState.breakpoint,
        prevState.cols,
        props.compactType
      )

      setState({ layout: newLayout })
    }
  }, [props])

  const onLayoutChange = usePersistFn((newLayout: Layout) => {
    props.onLayoutChange?.(newLayout, {
      ...props.layouts,
      [state.breakpoint]: newLayout
    })
  })

  const onWidthChange = usePersistFn(() => {
    const { breakpoints, cols, layouts, compactType, width } = props

    const newBreakpoint = getBreakpointFormWidth(breakpoints, width)
    const lastBreakpoint = state.breakpoint

    const newCols = getColsFromBreakpoint(newBreakpoint, cols)
    const newLayouts = { ...layouts }

    if (lastBreakpoint !== newBreakpoint || prevProps.breakpoints !== breakpoints || prevProps.cols !== cols) {
      if (!(lastBreakpoint in newLayouts)) {
        newLayouts[lastBreakpoint] = cloneLayout(state.layout)
      }

      let layout = findOrGenerateResponsiveLayout(newLayouts, breakpoints, newBreakpoint, lastBreakpoint, newCols, compactType)
      layout = syncLayoutWithChildren(layout, props.children, newCols, compactType)

      newLayouts[newBreakpoint] = layout

      props.onLayoutChange?.(layout, newLayouts)
      props.onBreakpointChange?.(newBreakpoint, newCols)

      setState({
        breakpoint: newBreakpoint,
        cols: newCols,
        layout
      })
    }

    const margin = getIndentationValue(props.margin, newBreakpoint)
    const containerPadding = getIndentationValue(props.containerPadding, newBreakpoint)

    props.onWidthChange?.(props.width, margin, newCols, containerPadding)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { breakpoints, cols, layouts, margin, containerPadding, onBreakpointChange, onLayoutChange: layoutChange, onWidthChange: widthChange, ...otherProps } = props
  return (
    <GridLayout
      {...otherProps}
      margin={getIndentationValue(margin, state.breakpoint)}
      containerPadding={getIndentationValue(containerPadding, state.breakpoint)}
      layout={state.layout}
      cols={state.cols}
      onLayoutChange={onLayoutChange} />
  )
}

ResponsiveGirdLayout.defaultProps = {
  layouts: {},
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  margin: [10, 10],
  containerPadding: {
    lg: [0, 0],
    md: [0, 0],
    sm: [0, 0],
    xs: [0, 0],
    xxs: [0, 0]
  },
  compactType: 'vertical'
}

export default memo(ResponsiveGirdLayout)
