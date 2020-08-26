import React, { ReactElement, FC, useState, CSSProperties } from 'react'
import classnames from 'clsx'
import { Resizable } from 'resizable'

import { calcGridItemPosition } from '@/utils/calculate'
import { PositionParams, Position, Size, Bound } from '../type'
import { setTransform, setTopLeft, perc } from '@/utils/utils'

export interface Props extends PositionParams {
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
  transformScale?: number
  className?: string
  style?: CSSProperties
}

const GridItem: FC<Props> = (props) => {
  const { x, y, w, h, minW, minH, maxW, maxH, isDraggable, isResizable, isStatic, useCSSTransforms, usePercentages, droppingPosition, className, style, cols, containerPadding, containerWidth, margin, maxRows, rowHeight } = props
  const positionParams = { cols, containerPadding, containerWidth, margin, maxRows, rowHeight }

  const [dragging, setDragging] = useState<Position>(null)
  const [resizing, setResizing] = useState<Size>(null)

  const pos = calcGridItemPosition(positionParams, x, y, w, h, { resizing, dragging })
  const child = React.Children.only(props.children)

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
    const minConstraints = [mins.width, mins.height]
    const maxConstraints = [
      Math.min(maxes.width, maxWidth),
      Math.max(maxes.height, Infinity)
    ]
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
      draggableOpts={{ disabled: !isResizable }}
      className={isResizable ? undefined : 'react-resizable-hide'}
      width={pos.width}
      height={pos.height}

    >
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
