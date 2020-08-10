import { SyntheticEvent } from 'react'

export interface DraggableData {
  node: HTMLElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
}
interface Props {
  handleNode: HTMLElement // 拖动区域的选择器
  cancelNode: HTMLElement //  不可拖动区域的选择器
  disabled: boolean // 是否开启关闭拖动
  onMouseDown: (e: SyntheticEvent<MouseEvent>) => void
}

export default function useDraggable(node: HTMLElement, props: Props) {
  const { disabled, handleNode, cancelNode } = props

  function onMouseUp(e: SyntheticEvent<MouseEvent>) {
    props.onMouseDown(e)

    const { ownerDocument } = node

    if (disabled ||
      !(e.target instanceof (<any>ownerDocument.defaultView).Node) ||
      !node.contains(handleNode) || node.contains(cancelNode))) {
      return
    }
  }
}
