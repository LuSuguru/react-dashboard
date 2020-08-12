import { int } from './utils'

export function outerRect(node: HTMLElement) {
  const { clientHeight, clientWidth } = node
  const { borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth } = node.ownerDocument.defaultView.getComputedStyle(node)

  return {
    height: clientHeight + int(borderTopWidth) + int(borderBottomWidth),
    width: clientWidth + int(borderLeftWidth) + int(borderRightWidth)
  }
}

export function innerRect(node: HTMLElement) {
  const { clientHeight, clientWidth } = node
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } = node.ownerDocument.defaultView.getComputedStyle(node)

  return {
    height: clientHeight - int(paddingTop) - int(paddingBottom),
    width: clientWidth - int(paddingLeft) - int(paddingRight)
  }
}

export function addUserSelectStyles(doc: Document) {
  if (!doc) return
  let styleEl = <HTMLStyleElement>doc.getElementById('react-draggable-style-el')

  if (!styleEl) {
    styleEl = doc.createElement('style')
    styleEl.type = 'text/css'
    styleEl.id = 'react-draggable-style-el'
    styleEl.innerHTML = '.react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n'
    styleEl.innerHTML += '.react-draggable-transparent-selection *::selection {all: inherit;}\n'
    doc.getElementsByTagName('head')[0].appendChild(styleEl)
  }
  if (doc.body) {
    doc.body.classList.add('react-draggable-transparent-selection')
  }
}

export function removeUserSelectStyles(doc: Document) {
  if (!doc) return

  if (doc.body) {
    doc.body.classList.remove('react-draggable-transparent-selection')
  }

  const selection = (doc.defaultView || window).getSelection()
  if (selection && selection.type !== 'Caret') {
    selection.removeAllRanges()
  }
}

// 校验选择器的元素是否存在在目标内
export function matchesAndParentsTo(el: Element, selector: string, parentNode: Element) {
  let node = el
  do {
    if (node.matches(selector)) return true
    if (node === parentNode) return false

    node = <Element>node.parentNode
  } while (node)

  return false
}
