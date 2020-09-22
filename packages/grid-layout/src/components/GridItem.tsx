import React, { ReactElement, FC, CSSProperties, MouseEvent, useEffect } from 'react'
import classnames from 'clsx'
import { Resizable } from 'resizable'
import { useDraggable, DraggableCoreProps } from 'draggable'
import { ResizeData } from 'resizable/es/type'
import { ResizableProps } from 'resizable/es/components/Resizable'

import { calcGridItemPosition, clacWH, clamp, clacXY, calcGridItemWHPx, calcGridColWidth } from '../utils/calculate'
import { setTransform, setTopLeft, perc } from '../utils/utils'
import useStates from '../hooks/useStates'
import { PositionParams, Position, Size, Bound, GridItemCallback, GridResizeEvent, GridDraggEvent, DroppingPosition } from '../type'

export interface GridItemProps extends PositionParams {
  children: ReactElement
  className?: string
  style?: CSSProperties

  x: number
  y: number
  w: number
  h: number

  i: string
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number

  handle?: string // 拖拽区域
  cancel?: string // 拖拽不可用区域

  isDraggable: boolean
  isResizable: boolean
  isBounded: boolean
  isStatic?: boolean

  droppingPosition?: DroppingPosition

  useCSSTransforms: boolean
  usePercentages?: boolean
  transformScale: number

  onResize?: GridItemCallback<GridResizeEvent>
  onResizeStart?: GridItemCallback<GridResizeEvent>
  onResizeStop?: GridItemCallback<GridResizeEvent>

  onDragStart?: GridItemCallback<GridDraggEvent>
  onDrag?: GridItemCallback<GridDraggEvent>
  onDragStop?: GridItemCallback<GridDraggEvent>
}

interface State {
  dragging: Position
  resizing: Size
}

const initialState: State = {
  dragging: null,
  resizing: null
}

const GridItem: FC<GridItemProps> = (props) => {
  const { cols, containerPadding, containerWidth, margin, maxRows, rowHeight, x, y, w, h } = props
  const positionParams = { cols, containerPadding, containerWidth, margin, maxRows, rowHeight }

  const [state, setState] = useStates(initialState)

  const pos = calcGridItemPosition(positionParams, x, y, w, h, state)

  const onDragStart: DraggableCoreProps['onStart'] = (e, { node }) => {
    const { i, transformScale } = props
    if (!props.onDragStart) return

    const newPosition: Position = { top: 0, left: 0 }

    const { offsetParent } = node
    if (!offsetParent) return

    const parentRect = offsetParent.getBoundingClientRect()
    const clientRect = node.getBoundingClientRect()

    const cLeft = clientRect.left / transformScale
    const pLeft = parentRect.left / transformScale
    const cTop = clientRect.top / transformScale
    const pTop = parentRect.top / transformScale

    newPosition.left = cLeft - pLeft + offsetParent.scrollLeft
    newPosition.top = cTop - pTop + offsetParent.scrollTop

    setState({ dragging: newPosition })
    const { x, y } = clacXY(positionParams, newPosition.top, newPosition.left, w, h)

    return props.onDragStart(i, x, y, { e, node, newPosition })
  }

  const onDrag: DraggableCoreProps['onDrag'] = (e, { node, deltaX, deltaY }) => {
    const { i, w, h, transformScale, isBounded, rowHeight, margin, containerWidth } = props
    const { dragging } = state
    if (!props.onDrag) return

    deltaX /= transformScale
    deltaY /= transformScale

    if (!dragging) {
      throw new Error('onDrag called before onDragStart.')
    }

    let left = dragging.left + deltaX
    let top = dragging.top + deltaY

    if (isBounded) {
      const { offsetParent } = node

      if (offsetParent) {
        const bottomBoundary = offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1])
        top = clamp(top, 0, bottomBoundary)

        const colWidth = calcGridColWidth(positionParams)
        const rightBoundary = containerWidth - calcGridItemWHPx(w, colWidth, margin[0])
        left = clamp(left, 0, rightBoundary)
      }
    }

    const newPosition = { top, left }
    setState({ dragging: newPosition })

    const { x, y } = clacXY(positionParams, top, left, w, h)
    return props.onDrag(i, x, y, { e, node, newPosition })
  }

  const onDragStop: DraggableCoreProps['onStop'] = (e, { node }) => {
    const { i, w, h } = props
    const { dragging } = state

    if (!props.onDragStop) return

    if (!dragging) {
      throw new Error('onDragEnd called before onDragStart')
    }

    const newPosition = dragging
    setState({ dragging: null })

    const { x, y } = clacXY(positionParams, dragging.top, dragging.left, w, h)
    return props.onDragStop(i, x, y, { e, node, newPosition })
  }

  // 注册 draggable
  const { nodeRef, onMouseDown, onMouseUp } = useDraggable({
    disabled: !props.isDraggable,
    onStart: onDragStart,
    onDrag,
    onStop: onDragStop,
    handle: props.handle,
    cancel: `.react-resizable-handle ${props.cancel ? `,${props.cancel}` : ''}`,
    scale: props.transformScale
  })

  const onResizeHandler = (e: MouseEvent<HTMLElement>, { node, size }: ResizeData, handlerName: 'onResizeStart' | 'onResizeStop' | 'onResize') => {
    const { i, x, cols, minH } = props
    const handler = props[handlerName]
    if (!handler) return

    let { minW, maxW } = props
    let { w, h } = clacWH(positionParams, size.width, size.height, x, y)

    minW = Math.max(minW, 1)
    maxW = Math.max(maxW, cols - x)

    w = clamp(w, minW, maxW)
    h = clamp(h, minH, maxW)

    setState({ resizing: handlerName == 'onResizeStop' ? null : size })
    handler(i, w, h, { e, node, size })
  }

  const onResizeStart: ResizableProps['onResizeStart'] = (e, data) => onResizeHandler(e, data, 'onResizeStart')
  const onResizeStop: ResizableProps['onResizeStop'] = (e, data) => onResizeHandler(e, data, 'onResizeStop')
  const onResize: ResizableProps['onResize'] = (e, data) => onResizeHandler(e, data, 'onResize')

  useEffect(() => {
    const { droppingPosition } = props
    const { dragging } = state

    if (!droppingPosition) return

    if (!dragging) {
      onDragStart(droppingPosition?.e as any, {
        node: nodeRef.current,
        deltaX: droppingPosition.left,
        deltaY: droppingPosition.top
      } as any)
    } else {
      const deltaX = droppingPosition.left - dragging.left
      const deltaY = droppingPosition.top - dragging.top

      onDrag(droppingPosition?.e as any, {
        node: nodeRef.current,
        deltaX,
        deltaY
      } as any)
    }
  }, [props.droppingPosition?.left, props.droppingPosition?.top])

  const { minW, minH, maxW, maxH, useCSSTransforms, usePercentages } = props

  const createStyle = (pos: Bound) => {
    let style: CSSProperties
    if (useCSSTransforms) {
      style = setTransform(pos)
    } else {
      style = setTopLeft(pos)

      if (usePercentages) {
        style.left = perc(pos.left / containerWidth)
        style.width = perc(pos.width / containerWidth)
      }
    }
    return style
  }

  const getMinOrMaxConstraints = () => {
    const maxWidth = calcGridItemPosition(positionParams, 0, 0, cols - x, 0).width
    const mins = calcGridItemPosition(positionParams, 0, 0, minW, minH)
    const maxes = calcGridItemPosition(positionParams, 0, 0, maxW, maxH)
    const minConstraints: [number, number] = [mins.width, mins.height]
    const maxConstraints: [number, number] = [
      Math.min(maxes.width, maxWidth),
      Math.max(maxes.height, Infinity)
    ]

    return { minConstraints, maxConstraints }
  }

  const child = React.Children.only(props.children)

  const newChild = React.cloneElement(child, {
    className: classnames(
      'react-grid-item',
      child.props.className,
      props.className,
      {
        isStatic: props.isStatic,
        resizing: !!state.resizing,
        'react-draggable': props.isDraggable,
        'react-draggable-dragging': !!state.dragging,
        dropping: !!props.droppingPosition,
        cssTransforms: useCSSTransforms
      }
    ),
    ref: nodeRef,
    onMouseDown,
    onMouseUp,
    style: {
      ...props.style,
      ...child.props.style,
      ...createStyle(pos)
    }
  })

  return (
    <Resizable
      {...getMinOrMaxConstraints()}
      draggableOpts={{ disabled: !props.isResizable }}
      className={props.isResizable ? undefined : 'react-resizable-hide'}
      width={pos.width}
      height={pos.height}
      transformScale={props.transformScale}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}>
      {newChild}
    </Resizable>
  )
}

GridItem.defaultProps = {
  className: '',
  cancel: '',
  handle: '',
  minW: 1,
  minH: 1,
  maxW: Infinity,
  maxH: Infinity,
  transformScale: 1
}

export default GridItem
