/* eslint-disable @typescript-eslint/indent */
import React, { memo, FC, RefObject, Children, ReactElement, MouseEvent, useEffect, useMemo } from 'react'
import classnames from 'clsx'
import isEqual from 'lodash/isEqual'

import { useStates, useMoveElement, usePrevious, useUpdateEffect } from '../hooks'
import { correctBounds, compact, getAllCollisions } from '../utils/collision'
import { getBottom, cloneLayoutItem, getLayoutItem, childrenEqual } from '../utils/utils'
import { Layout, CompactType, LayoutItem, DroppingPosition } from '../type'

import GridItem, { GridItemProps } from './GridItem'
import Placeholder from './Placeholder'

type ExtendsProps = Partial<Pick<GridItemProps,
  | 'className'
  | 'style'
  | 'cols'
  | 'rowHeight'
  | 'maxRows'
  | 'margin'
  | 'containerPadding'
  | 'isBounded'
  | 'isDraggable'
  | 'isResizable'
  | 'useCSSTransforms'
  | 'transformScale'>>

type EventCallbck = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent<HTMLElement>, node: HTMLElement) => void

interface GridLayoutProps extends ExtendsProps {
  children: ReactElement[]
  width: number
  layout: Layout
  autoSize?: boolean
  isDroppable?: boolean // 是否开启拖拽
  preventCollision?: boolean // 是否阻止碰撞

  vertialCompact?: boolean
  compactType?: CompactType

  draggableCancel?: string
  draggableHandle?: string

  innerRef?: RefObject<HTMLDivElement>

  onDragStart?: EventCallbck
  onDrag?: EventCallbck
  onDragStop?: EventCallbck
  onResize?: EventCallbck
  onResizeStart?: EventCallbck
  onResizeStop?: EventCallbck
  onLayoutChange?: (newLayout: Layout) => void
}

interface State {
  layout: Layout
  activeDrag: LayoutItem
  droppingPosition: DroppingPosition // 拖拽位置
  droppingDOMNode: ReactElement // 拖拽元素
  oldLayout: Layout
  oldDragItem: LayoutItem
  oldResizeItem: LayoutItem
}

const layoutClassName = 'react-grid-layout'

const getCompactType = (vertialCompact: boolean, compactType: CompactType) => (vertialCompact ? compactType : null)

// 同步 layout
function syncLayoutWithChildren(initialLayout: Layout = [], children: ReactElement[], cols: number, compactType: CompactType): Layout {
  const layout: LayoutItem[] = []

  Children.forEach(children, (child: ReactElement, index: number) => {
    // 获取 layoutItem 从 layout props 或者 child 的 data-grid 上
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

  const correctedLayout = correctBounds(layout, cols)
  return compact(correctedLayout, compactType, cols)
}

// TODO: 外部拖拽待加
const GridLayout: FC<GridLayoutProps> = (props) => {
  const moveElement = useMoveElement(getCompactType(props.vertialCompact, props.compactType))
  const [state, setState] = useStates<State>({
    layout: syncLayoutWithChildren(props.layout, props.children, props.cols, getCompactType(props.vertialCompact, props.compactType)),
    activeDrag: null,
    droppingPosition: null,
    droppingDOMNode: null,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null
  })
  const prevProps = usePrevious(props)
  const prevState = usePrevious(state)

  const onLayoutMaybeChanged = (newLayout: Layout, oldLayout: Layout) => {
    if (!oldLayout) {
      oldLayout = state.layout
    }

    if (!isEqual(oldLayout, newLayout)) {
      props.onLayoutChange?.(newLayout)
    }
  }

  useEffect(() => {
    if (!state.activeDrag) {
      onLayoutMaybeChanged(state.layout, prevState?.layout)
    }
  }, [state.activeDrag, state.droppingPosition, props.children])

  // 监听 layout，compactType，children 变化，更新 state 的 layout
  useUpdateEffect(() => {
    const { layout, children, cols, vertialCompact, compactType } = props
    if (state.activeDrag) {
      return
    }

    let newLayoutBase: Layout
    if (!isEqual(layout, prevProps?.layout) || compactType !== prevProps?.compactType) {
      newLayoutBase = props.layout
    } else if (!childrenEqual(prevProps.children, children)) {
      newLayoutBase = prevState?.layout
    }

    if (newLayoutBase) {
      setState({ layout: syncLayoutWithChildren(newLayoutBase, children, cols, getCompactType(vertialCompact, compactType)) })
    }
  }, [props.layout, props.compactType, props.children])

  // 拖拽移动开始
  const onDragStart: GridItemProps['onDragStart'] = (i, _x, _y, { e, node }) => {
    const { layout } = state
    const l = getLayoutItem(layout, i)

    if (!l) return

    setState({
      oldDragItem: cloneLayoutItem(l),
      oldLayout: layout
    })

    props.onDragStart?.(layout, l, l, null, e, node)
  }

  const onDrag: GridItemProps['onDrag'] = (i, x, y, { e, node }) => {
    const { cols, preventCollision, vertialCompact, compactType } = props
    const { oldDragItem } = state
    let { layout } = state

    const l = getLayoutItem(layout, i)
    if (!l) return

    const placeholder = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      i
    }

    const partCompactType = getCompactType(vertialCompact, compactType)
    // 移动元素到拖拽的位置
    layout = moveElement(layout, l, x, y, true, preventCollision)
    const newLayout = compact(layout, partCompactType, cols)

    props.onDrag?.(layout, oldDragItem, l, placeholder, e, node)
    setState({
      layout: newLayout,
      activeDrag: placeholder
    })
  }

  const onDragStop: GridItemProps['onDragStop'] = (i, x, y, { e, node }) => {
    const { cols, preventCollision, vertialCompact, compactType } = props
    const { activeDrag, oldDragItem, oldLayout } = state
    let { layout } = state
    if (!activeDrag) return

    const l = getLayoutItem(layout, i)
    if (!l) return

    const partCompactType = getCompactType(vertialCompact, compactType)
    layout = moveElement(layout, l, x, y, true, preventCollision)
    const newLayout = compact(layout, partCompactType, cols)

    props.onDragStop?.(layout, oldDragItem, l, null, e, node)
    setState({
      layout: newLayout,
      activeDrag: null,
      oldDragItem: null,
      oldLayout: null
    })

    onLayoutMaybeChanged(newLayout, oldLayout)
  }

  const onResizeStart: GridItemProps['onResizeStart'] = (i, _w, _h, { e, node }) => {
    const { layout } = state
    const l = getLayoutItem(layout, i)
    if (!l) return

    setState({
      oldResizeItem: cloneLayoutItem(l),
      oldLayout: layout
    })

    props.onResizeStart?.(layout, l, l, null, e, node)
  }

  const onResize: GridItemProps['onResize'] = (i, w, h, { e, node }) => {
    const { layout, oldResizeItem } = state
    const { cols, preventCollision, vertialCompact, compactType } = props

    const l = getLayoutItem(layout, i)
    if (!l) return

    let hasCollisions: boolean
    if (preventCollision) {
      const collisions = getAllCollisions(layout, { ...l, w, h }).filter(({ i }) => i !== l.i)
      hasCollisions = collisions.length > 0

      // 在禁止碰撞的情况下，找出当前 item 的最大 w,h 已适配空间
      if (hasCollisions) {
        let leastX = Infinity
        let leastY = Infinity

        collisions.forEach(layoutItem => {
          if (layoutItem.x > l.x) leastX = Math.min(leastX, layoutItem.x)
          if (layoutItem.y > l.y) leastY = Math.min(leastY, layoutItem.y)
        })

        if (Number.isFinite(leastX)) l.w = leastX - l.x
        if (Number.isFinite(leastY)) l.y = leastY - l.y
      }
    }

    if (!hasCollisions) {
      l.w = w
      l.h = h
    }

    const placeholder: LayoutItem = {
      w: l.w,
      h: l.h,
      x: l.x,
      y: l.y,
      isStatic: true,
      i
    }

    props.onResize?.(layout, oldResizeItem, l, placeholder, e, node)
    setState({
      layout: compact(layout, getCompactType(vertialCompact, compactType), cols),
      activeDrag: placeholder
    })
  }

  const onResizeStop: GridItemProps['onResizeStop'] = (i, w, h, { e, node }) => {
    const { layout, oldResizeItem, oldLayout } = state
    const { cols, vertialCompact, compactType } = props
    const l = getLayoutItem(layout, i)

    props.onResizeStop?.(layout, oldResizeItem, l, null, e, node)

    const newLayout = compact(layout, getCompactType(vertialCompact, compactType), cols)
    setState({
      layout: newLayout,
      activeDrag: null,
      oldResizeItem: null,
      oldLayout: null
    })

    onLayoutMaybeChanged(newLayout, oldLayout)
  }

  const containerHeight = () => {
    const { autoSize, containerPadding, margin, rowHeight } = props
    if (!autoSize) return

    const row = getBottom(state.layout)
    const containerPaddingY = containerPadding ? containerPadding[1] : margin[1]
    return `${(row * rowHeight) + (row - 1) * margin[1] + containerPaddingY * 2}px`
  }

  const processGridItem = (child: ReactElement, isDroppingItem = false) => {
    const { isBounded, width, cols, margin, containerPadding, maxRows, rowHeight, draggableCancel, draggableHandle, useCSSTransforms, transformScale, isDraggable, isResizable } = props
    const { droppingPosition, layout } = state

    if (!child || !child.key) return
    const l = getLayoutItem(layout, child.key + '')
    if (!l) return

    const draggable = typeof l.isDraggable === 'boolean'
      ? l.isDraggable
      : !l.isStatic && isDraggable
    const resizable = typeof l.isResizable === 'boolean'
      ? l.isResizable
      : !l.isStatic && isResizable

    const bounded = draggable && isBounded && l.isBounded !== false

    return (
      <GridItem
        containerWidth={width}
        cols={cols}
        margin={margin}
        containerPadding={containerPadding || margin}
        maxRows={maxRows}
        rowHeight={rowHeight}
        cancel={draggableCancel}
        handle={draggableHandle}
        isDraggable={draggable}
        isResizable={resizable}
        isBounded={bounded}
        useCSSTransforms={useCSSTransforms}
        transformScale={transformScale}
        w={l.w}
        h={l.h}
        x={l.x}
        y={l.y}
        i={l.i}
        minH={l.minH}
        minW={l.minW}
        maxH={l.maxH}
        maxW={l.maxW}
        isStatic={l.isStatic}
        droppingPosition={isDroppingItem ? droppingPosition : undefined}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragStop={onDragStop}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeStop={onResizeStop}>
        {child}
      </GridItem>
    )
  }

  return useMemo(() => {
    const { innerRef, className, style, children, isDroppable, width, cols, margin, containerPadding, rowHeight, maxRows, useCSSTransforms, transformScale } = props
    const { droppingDOMNode, activeDrag } = state

    return (
      <div
        ref={innerRef}
        className={classnames(layoutClassName, className)}
        style={{
          height: containerHeight(),
          ...style
        }}>

        {Children.map(children, (child: ReactElement) => processGridItem(child))}

        {isDroppable && droppingDOMNode && processGridItem(droppingDOMNode, true)}

        <Placeholder
          activeDrag={activeDrag}
          width={width}
          cols={cols}
          margin={margin}
          containerPadding={containerPadding}
          rowHeight={rowHeight}
          maxRows={maxRows}
          useCSSTransforms={useCSSTransforms}
          transformScale={transformScale} />
      </div>
    )
  }, [state.activeDrag, state.droppingPosition, props.children])
}

GridLayout.defaultProps = {
  children: [],
  className: '',
  layout: [],
  style: {},
  autoSize: true,
  cols: 12,
  rowHeight: 150,
  maxRows: Infinity,
  margin: [10, 10],
  containerPadding: null,
  isBounded: false,
  isDraggable: true,
  isResizable: true,
  isDroppable: false,
  preventCollision: false,
  useCSSTransforms: true,
  transformScale: 1,
  vertialCompact: true,
  compactType: 'vertical',
  draggableCancel: '',
  draggableHandle: ''
}

export default memo(GridLayout)
