/* eslint-disable @typescript-eslint/indent */
import React, { memo, FC, RefObject } from 'react'
import classnames from 'clsx'

import GirdItem, { GirdItemProps } from './GirdItem'
import { getBottom, syncLayoutWithChildren } from '@/utils/utils'
import useStates from '@/utils/useStates'
import { Layout, CompactType } from '@/type'

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
  isDroppable?: boolean

  vertialCompact?: boolean
  compactType?: CompactType

  innerRef?: RefObject<HTMLDivElement>
}

interface State {
  layout: Layout
}

const layoutClassName = 'react-grid-layout'

const getCompactType = (vertialCompact: boolean, compactType: CompactType) => (vertialCompact ? compactType : null)

const GirdLayout: FC<GirdLayoutProps> = (props) => {
  const { className, style, innerRef, autoSize, containerPadding, margin, rowHeight, cols, layout, children, vertialCompact, compactType } = props
  const [state, setState] = useStates({
    layout: syncLayoutWithChildren(layout, children, cols, getCompactType(vertialCompact, compactType))
  })

  const containerHeight = () => {
    if (!autoSize) return
    const row = getBottom(state.layout)
    const containerPaddingY = containerPadding ? containerPadding[1] : margin[1]

    return `${(row * rowHeight) + (row - 1) * margin[1] + containerPaddingY * 2}px`
  }

  return (
    <div
      ref={innerRef}
      className={classnames(layoutClassName, className)}
      style={{
        height: containerHeight(),
        ...style
      }}>
      1
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
  compactType: 'vertical'
}

export default memo(GirdLayout)
