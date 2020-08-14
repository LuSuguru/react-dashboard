import React from 'react'
import ReactDOM from 'react-dom'
import DraggableExample from './components/draggable-example'
import ResizableExample from './components/resize-example'

import './style.less'

ReactDOM.render((
  <>
    <DraggableExample />
    {/* <ResizableExample /> */}
  </>), document.getElementById('root'))


if (module.hot) {
  module.hot.accept()
}
