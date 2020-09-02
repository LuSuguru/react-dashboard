/* eslint-disable @typescript-eslint/indent */
import React, { memo, FC, RefObject, Children, ReactElement, ReactChild, ReactNode } from 'react'
import classnames from 'clsx'

import { getBottom, cloneLayoutItem } from '@/utils/utils'
import useStates from '@/utils/useStates'
import { Layout, CompactType, LayoutItem, DroppingPosition } from '@/type'
import { correctBounds, compact } from '@/utils/collision'

import GirdItem, { GirdItemProps } from './GirdItem'
import Placeholder from './Placeholder'
import GridItem from './GirdItem'

type ExtendsProps = Partial<Pick<GirdItemProps,
  | 'children'
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

interface GirdLayoutProps extends ExtendsProps {
  width: number
  layout: Layout
  autoSize?: boolean
  isDroppable?: boolean // 是否开启拖拽

  vertialCompact?: boolean
  compactType?: CompactType

  draggableCancel?: string
  draggableHandle?: string

  innerRef?: RefObject<HTMLDivElement>
}

interface State {
  layout: Layout
  activeDrag: LayoutItem
  mounted: boolean
  droppingPosition: DroppingPosition // 拖拽位置
  droppingDOMNode: ReactElement // 拖拽元素
  oldLayout: Layout
  oldDragItem: LayoutItem
  oldResizeItem: LayoutItem
}

const layoutClassName = 'react-grid-layout'

const getCompactType = (vertialCompact: boolean, compactType: CompactType) => (vertialCompact ? compactType : null)

// 同步 layout
function syncLayoutWithChildren(initialLayout: Layout = [], children: ReactChild, cols: number, compactType: CompactType): Layout {
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

const GirdLayout: FC<GirdLayoutProps> = (props) => {
  const { width, layout, autoSize, children, className, style, innerRef, containerPadding, margin, rowHeight, cols, maxRows, vertialCompact, compactType, useCSSTransforms, transformScale, isBounded, isDroppable, draggableHandle, draggableCancel } = props
  const [state, setState] = useStates<State>({
    layout: syncLayoutWithChildren(layout, children, cols, getCompactType(vertialCompact, compactType)),
    activeDrag: null,
    mounted: false,
    droppingPosition: null,
    droppingDOMNode: null,
    oldDragItem: null,
    oldLayout: null,
    oldResizeItem: null
  })

  const { activeDrag, mounted, droppingPosition, droppingDOMNode } = state

  const onDragStart = ()

  const containerHeight = () => {
    if (!autoSize) return
    const row = getBottom(state.layout)
    const containerPaddingY = containerPadding ? containerPadding[1] : margin[1]

    return `${(row * rowHeight) + (row - 1) * margin[1] + containerPaddingY * 2}px`
  }

  const processGridItem = (child: ReactElement, isDroppingItem = false) => {
    if (!child || !child.key) return
    const l = state.layout.find(({ i }) => i === child.key + '')
    if (!l) return

    const draggable = typeof l.isDraggable === 'boolean'
      ? l.isDraggable
      : l.isStatic && l.isDraggable
    const resizable = typeof l.isResizable === 'boolean'
      ? l.isResizable
      : l.isStatic && l.isResizable

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
        useCSSTransforms={useCSSTransforms && mounted}
        usePercentages={!mounted}
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
}

GirdLayout.defaultProps = {
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
  useCSSTransforms: true,
  transformScale: 1,
  vertialCompact: true,
  compactType: 'vertical',
  draggableCancel: '',
  draggableHandle: ''
}

export default memo(GirdLayout)
