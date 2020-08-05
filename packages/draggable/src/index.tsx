import React, { ReactElement, cloneElement, useRef } from 'react'
import useDraggable from './useDraggable'
import { findDOMNode } from 'react-dom'

interface Props {
  children: ReactElement
}

function Draggable(props: Props) {
  const nodeRef = useRef<Node>(null)

  useDraggable(nodeRef)

  return cloneElement(React.Children.only(props.children), {
    ref: nodeRef
  })
}

export default Draggable
export { useDraggable }
