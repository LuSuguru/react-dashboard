import { useEffect, useState } from 'react'
import { layoutClassName } from '../components/GridLayout'

export default function useResize(initialWidth: number) {
  const [width, setWidth] = useState(initialWidth)

  useEffect(() => {
    const onWindowResize = () => {
      const node = document.querySelector(`.${layoutClassName}`) as HTMLDivElement
      console.log(node.offsetWidth)
      setWidth(node.offsetWidth)
    }

    window.addEventListener('resize', onWindowResize)
    onWindowResize()

    return () => {
      window.removeEventListener('resize', onWindowResize)
    }
  }, [])

  return width
}
