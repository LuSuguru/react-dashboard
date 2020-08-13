import React from 'react'
import ReactDOM from 'react-dom'
import DraggableExample from './components/draggable-example'

import './style.less'

ReactDOM.render((
  <>
    <DraggableExample />
  </>), document.getElementById('root'))


if (module.hot) {
  module.hot.accept()
}
