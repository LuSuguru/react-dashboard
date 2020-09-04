import React, { ReactElement, FC, useState, CSSProperties, MouseEvent, useMemo, useEffect } from 'react'
import classnames from 'clsx'
import { Resizable } from 'resizable'
import { useDraggable, DraggableCoreProps } from 'draggable'
import { ResizeData } from 'resizable/es/type'
import { ResizableProps } from 'resizable/es/components/Resizable'

import { calcGridItemPosition, clacWH, clamp, clacXY, calcGirdItemWHPx, calcGirdColWidth } from '@/utils/calculate'
import { setTransform, setTopLeft, perc } from '@/utils/utils'
import { PositionParams, Position, Size, Bound, GridItemCallback, GirdResizeEvent, GirdDraggEvent, DroppingPosition } from '@/type'

export interface GirdItemProps extends PositionParams {
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

  onResize?: GridItemCallback<GirdResizeEvent>
  onResizeStart?: GridItemCallback<GirdResizeEvent>
  onResizeStop?: GridItemCallback<GirdResizeEvent>

  onDragStart?: GridItemCallback<GirdDraggEvent>
  onDrag?: GridItemCallback<GirdDraggEvent>
  onDragStop?: GridItemCallback<GirdDraggEvent>
}

const GridItem: FC<GirdItemProps> = (props) => {
  const { cols, containerPadding, containerWidth, margin, maxRows, rowHeight } = props
  const positionParams = { cols, containerPadding, containerWidth, margin, maxRows, rowHeight }

  const [dragging, setDragging] = useState<Position>(null)
  const [resizing, setResizing] = useState<Size>(null)

  const pos = calcGridItemPosition(positionParams, x, y, w, h, { resizing, dragging })

  const onDragStart: DraggableCoreProps['onStart'] = (e, { node }) => {
    const { i, transformScale, onDragStart } = props
    if (!onDragStart) return

    const newPosition: Position = { top: 0, left: 0 }

    const { offsetParent } = node
    if (!offsetParent) return

    const parentRect = offsetParent.getBoundingClientRect()
    const clientRect = offsetParent.getBoundingClientRect()

    const cLeft = clientRect.left / transformScale
    const pLeft = parentRect.left / transformScale
    const cTop = clientRect.top / transformScale
    const pTop = parentRect.top / transformScale

    newPosition.left = cLeft - pLeft + offsetParent.scrollLeft
    newPosition.top = cTop - pTop + offsetParent.scrollTop

    setDragging(newPosition)
    const { x, y } = clacXY(positionParams, newPosition.top, newPosition.left, w, h)

    return onDragStart(i, x, y, { e, node, newPosition })
  }

  const onDrag: DraggableCoreProps['onDrag'] = (e, { node, deltaX, deltaY }) => {
    const { i, w, h, transformScale, isBounded, rowHeight, margin, containerWidth, onDrag } = props
    if (!onDrag) return

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
        const bottomBoundary = offsetParent.clientHeight - calcGirdItemWHPx(h, rowHeight, margin[1])
        top = clamp(top, 0, bottomBoundary)

        const colWidth = calcGirdColWidth(positionParams)
        const rightBoundary = containerWidth - calcGirdItemWHPx(w, colWidth, margin[0])
        left = clamp(left, 0, rightBoundary)
      }
    }

    const newPosition = { top, left }
    setDragging(newPosition)

    const { x, y } = clacXY(positionParams, top, left, w, h)
    return onDrag(i, x, y, { e, node, newPosition })
  }

  const onDragStop: DraggableCoreProps['onStop'] = (e, { node }) => {
    const { i, w, h, onDragStop } = props
    if (!onDragStop) return

    if (!dragging) {
      throw new Error('onDragEnd called before onDragStart')
    }

    const newPosition = dragging
    setDragging(null)

    const { x, y } = clacXY(positionParams, dragging.top, dragging.left, w, h)
    return onDragStop(i, x, y, { e, node, newPosition })
  }

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

    setResizing(handlerName == 'onResizeStop' ? null : size)
    handler(i, w, h, { e, node, size })
  }

  const onResizeStart: ResizableProps['onResizeStart'] = (e, data) => onResizeHandler(e, data, 'onResizeStart')
  const onResizeStop: ResizableProps['onResizeStop'] = (e, data) => onResizeHandler(e, data, 'onResizeStop')
  const onResize: ResizableProps['onResize'] = (e, data) => onResizeHandler(e, data, 'onResize')

  const { nodeRef, onMouseDown, onMouseUp } = useDraggable({
    disabled: props.isDraggable,
    onStart: onDragStart,
    onDrag,
    onStop: onDragStop,
    handle: props.handle,
    cancel: `.react-resizable-handle ${props.cancel ? `,${props.cancel}` : ''}`,
    scale: props.transformScale
  })

  useEffect(() => {
    const { droppingPosition } = props
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

  return useMemo(() => {
    const { x, minW, minH, maxW, maxH, useCSSTransforms, usePercentages } = props

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
      classNames: classnames(
        'react-grid-item',
        child.props.className,
        props.className,
        {
          isStatic: props.isStatic,
          resizing: !!resizing,
          'react-draggable': props.isDraggable,
          'react-draggable-dragging': !!dragging,
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
  }, [pos.height, pos.width, pos.left, pos.top, props.useCSSTransforms])
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
