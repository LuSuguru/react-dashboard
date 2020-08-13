import React, { ReactElement, cloneElement, useRef, useState, useEffect, MouseEvent } from 'react'
import classnames from 'clsx'

import useDraggable, { DraggableData, Props as DraggableCoreProps, defaultCoreProps } from './useDraggable'
import { innerRect, outerRect } from './utils/dom'
import { int, isNum } from './utils/utils'
import browserPrefix, { browserPrefixToKey } from './utils/getPrefix'

interface Position {
  x: number
  y: number
}

interface PositionOffset {
  x: number | string
  y: number | string
}

interface BoundRect {
  left: number
  right: number
  top: number
  bottom: number
}

type Axis = 'both' | 'x' | 'y' | 'none'

interface Props extends DraggableCoreProps {
  axis?: Axis
  bounds?: BoundRect | string
  children?: ReactElement
  positionOffset?: PositionOffset
  position?: Position
  defaultPosition?: Position
  defaultClassName?: string
  defaultClassNameDragging?: string
  defaultClassNameDragged?: string
}

const defaultProps: Props = {
  ...defaultCoreProps,
  axis: 'both',
  bounds: undefined,
  defaultClassName: 'draggable',
  defaultClassNameDragging: 'draggable-dragging',
  defaultClassNameDragged: 'draggable-dragged',
  defaultPosition: { x: 0, y: 0 },
  position: null
}

function canDrag(axis: Axis, targetAxis: Axis) {
  return axis === 'both' || axis === targetAxis
}

function getBoundPosition(node: HTMLElement, bounds: BoundRect | string, x: number, y: number) {
  if (!bounds) return [x, y]

  if (typeof bounds == 'string') {
    const { ownerDocument } = node
    const { defaultView: ownerWindow } = ownerDocument

    const boundNode = bounds === 'parent' ? node.parentNode : ownerDocument.querySelector(bounds)

    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      throw new Error('Bounds selector "' + bounds + '" could not find an element.')
    }

    const nodeStyle = ownerWindow.getComputedStyle(node)
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNode)

    const boundInnerRect = innerRect(boundNode)
    const nodeOuterRect = outerRect(node)

    bounds = {
      left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right: boundInnerRect.width - nodeOuterRect.width - node.offsetLeft + int(boundNodeStyle.paddingLeft) - int(nodeStyle.marginRight),
      bottom: boundInnerRect.height - nodeOuterRect.height - node.offsetTop + int(boundNodeStyle.paddingTop) - int(nodeStyle.marginBottom)
    }
  } else {
    bounds = { ...bounds }
  }

  if (isNum(bounds.right)) x = Math.min(x, bounds.right)
  if (isNum(bounds.bottom)) y = Math.min(y, bounds.bottom)

  if (isNum(bounds.left)) x = Math.max(x, bounds.left)
  if (isNum(bounds.top)) y = Math.max(y, bounds.top)

  return [x, y]
}

function getTranslation({ x, y }: Position, positionOffset: PositionOffset, unitSuffix: string) {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`

  if (positionOffset) {
    const defaultX = `${(typeof positionOffset.x === 'string') ? positionOffset.x : positionOffset.x + unitSuffix}`
    const defaultY = `${(typeof positionOffset.y === 'string') ? positionOffset.y : positionOffset.y + unitSuffix}`
    translation = `translate(${defaultX}, ${defaultY})` + translation
  }

  return translation
}

function createTranslation(position: Position, positionOffset: PositionOffset) {
  return { [browserPrefixToKey('transform', browserPrefix)]: getTranslation(position, positionOffset, 'px') }
}

function Draggable(props: Props) {
  const {
    axis,
    bounds,
    scale,
    children,
    positionOffset,
    position,
    defaultPosition,
    defaultClassName,
    defaultClassNameDragged,
    defaultClassNameDragging,
    ...coreProps } = { ...defaultProps, ...props }

  const [dragged, setDragged] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [slack, setSlack] = useState({
    slackX: 0,
    slackY: 0
  })
  const [state, setState] = useState<Position>({
    x: position?.x || defaultPosition?.x,
    y: position?.y || defaultPosition?.y
  })

  const nodeRef = useRef<HTMLElement>(null)
  const controlled = !!position

  const { onMouseDown, onMouseUp } = useDraggable(nodeRef, {
    ...coreProps,
    onStart,
    onDrag,
    onStop
  })

  // 卸载时 dragging 为 false
  useEffect(() => () => setDragging(false), [])

  useEffect(() => {
    if (position?.x && position?.y) {
      setState({
        x: position.x,
        y: position.y
      })
    }
  }, [position?.x, position?.y])

  function createDraggableData(coreData: DraggableData): DraggableData {
    return {
      node: coreData.node,
      x: state.x + coreData.deltaX / scale,
      y: state.y + coreData.deltaY / scale,
      deltaX: coreData.deltaX / scale,
      deltaY: coreData.deltaY / scale,
      lastX: state.x,
      lastY: state.y
    }
  }

  function onStart(e: MouseEvent<HTMLElement>, coreData: DraggableData) {
    const shouldStart = props.onStart?.(e, createDraggableData(coreData))

    if (shouldStart === false) return false

    setDragging(true)
    setDragged(true)
  }

  function onDrag(e: MouseEvent<HTMLElement>, coreData: DraggableData) {
    if (!dragging) return false

    const uiData = createDraggableData(coreData)
    const newState: Position = {
      x: uiData.x,
      y: uiData.y
    }

    if (bounds) {
      const { x, y } = newState

      newState.x += slack.slackX
      newState.y += slack.slackY

      const [newStateX, newStateY] = getBoundPosition(nodeRef.current, bounds, newState.x, newState.y)
      newState.x = newStateX
      newState.y = newStateY

      const newSlackX = slack.slackX + (x - newState.x)
      const newSlackY = slack.slackY + (y - newState.y)

      uiData.x = newState.x
      uiData.y = newState.y
      uiData.deltaX = newState.x - state.x
      uiData.deltaY = newState.y - state.y

      setSlack({
        slackX: newSlackX,
        slackY: newSlackY
      })
    }

    const shouldUpdate = props.onDrag?.(e, uiData)
    if (shouldUpdate === false) return false

    setState(newState)
  }

  function onStop(e: MouseEvent<HTMLElement>, coreData: DraggableData) {
    if (!dragging) return false

    const shouldContinue = props.onStop?.(e, createDraggableData(coreData))
    if (shouldContinue === false) return false

    setDragging(false)
    setSlack({ slackX: 0, slackY: 0 })
  }

  const draggable = !controlled || dragging
  const currentPosition = position || defaultPosition

  const tranformOpts: Position = {
    x: canDrag(axis, 'x') && draggable ? state.x : currentPosition.x,
    y: canDrag(axis, 'y') && draggable ? state.y : currentPosition.y
  }

  const style = createTranslation(tranformOpts, positionOffset)
  const className = classnames(children.props.className || '', defaultClassName, {
    [defaultClassNameDragging]: dragging,
    [defaultClassNameDragged]: dragged
  })

  return cloneElement(React.Children.only(children), {
    ref: nodeRef,
    className,
    style: { ...children.props.style, ...style },
    onMouseDown,
    onMouseUp
  })
}

export default Draggable

export { useDraggable }
