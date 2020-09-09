/* eslint-disable @typescript-eslint/indent */
import React, { memo, FC } from 'react'
import { LayoutItem } from '../type'
import GridItem, { GridItemProps } from './GridItem'

type ExtendProps = Pick<GridItemProps,
  | 'cols'
  | 'margin'
  | 'containerPadding'
  | 'rowHeight'
  | 'maxRows'
  | 'useCSSTransforms'
  | 'transformScale'
>

interface Props extends ExtendProps {
  activeDrag: LayoutItem
  width: number
}

const Placeholder: FC<Props> = (props) => {
  const { activeDrag, width, cols, margin, containerPadding, maxRows, rowHeight, useCSSTransforms, transformScale } = props

  if (!activeDrag) return null

  return (
    <GridItem
      {...activeDrag}
      className="react-grid-placeholder"
      containerWidth={width}
      cols={cols}
      margin={margin}
      containerPadding={containerPadding || margin}
      maxRows={maxRows}
      rowHeight={rowHeight}
      isDraggable={false}
      isResizable={false}
      isBounded={false}
      useCSSTransforms={useCSSTransforms}
      transformScale={transformScale}>
      <div />
    </GridItem>
  )
}

export default memo(Placeholder)
