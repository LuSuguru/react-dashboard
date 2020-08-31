import React, { ReactElement, FC, useState, CSSProperties, MouseEvent } from 'react'
import classnames from 'clsx'
import { Resizable } from 'resizable'
import { ResizeData } from 'resizable/es/type'
import { ResizableProps } from 'resizable/es/components/Resizable'

import { calcGridItemPosition } from '@/utils/calculate'
import { setTransform, setTopLeft, perc } from '@/utils/utils'
import { PositionParams, Position, Size, Bound } from '@/type'

export interface Props extends PositionParams, Pick<ResizableProps, 'transformScale' | 'onResizeStart' | 'onResizeStop' | 'onResize'> {
  children: ReactElement
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  handle?: string
  cancel?: string
  isDraggable: boolean
  isResizable: boolean
  isStatic: boolean
  droppingPosition: {
    e: any
    left: number
    right: number
  }
  useCSSTransforms: boolean
  usePercentages: boolean
  className?: string
  style?: CSSProperties
}

const GridItem: FC<Props> = (props) => {
  const { x, y, w, h, minW, minH, maxW, maxH, isDraggable, isResizable, isStatic, useCSSTransforms, usePercentages, droppingPosition, transformScale, className, style, cols, containerPadding, containerWidth, margin, maxRows, rowHeight } = props
  const positionParams = { cols, containerPadding, containerWidth, margin, maxRows, rowHeight }

  const [dragging, setDragging] = useState<Position>(null)
  const [resizing, setResizing] = useState<Size>(null)

  const pos = calcGridItemPosition(positionParams, x, y, w, h, { resizing, dragging })
  const child = React.Children.only(props.children)

  const onResizeHandler = (e: MouseEvent<HTMLElement>, data: ResizeData, handleName: 'onResizeStart' | 'onResizeStop' | 'onResize') => {
    const handler = props[handleName]

    if (!handler) return
  }

  const onResizeStart: ResizableProps['onResizeStart'] = (e, data) => onResizeHandler(e, data, 'onResizeStart')
  const onResizeStop: ResizableProps['onResizeStop'] = (e, data) => onResizeHandler(e, data, 'onResizeStop')
  const onResize: ResizableProps['onResize'] = (e, data) => onResizeHandler(e, data, 'onResize')

  function createStyle(pos: Bound): CSSProperties {
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

  function getMinOrMaxConstraints() {
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

  const newChild = React.cloneElement(child, {
    classNames: classnames(
      'react-grid-item',
      child.props.className,
      className,
      {
        isStatic,
        resizing: !!resizing,
        'react-draggable': isDraggable,
        'react-draggable-dragging': !!dragging,
        dropping: !!droppingPosition,
        cssTransforms: useCSSTransforms
      }
    ),
    style: {
      ...style,
      ...child.props.style,
      ...createStyle(pos)
    }
  })

  return (
    <Resizable
      {...getMinOrMaxConstraints()}
      draggableOpts={{ disabled: !isResizable }}
      className={isResizable ? undefined : 'react-resizable-hide'}
      width={pos.width}
      height={pos.height}
      transformScale={transformScale}
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

export default GirdItem
