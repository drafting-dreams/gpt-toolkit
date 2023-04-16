import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import cx from 'classnames'
import classes from './Toast.module.scss'

import type { Dispatch, SetStateAction } from 'react'

export const ToastContext = createContext<{
  content: string
  setContent: Dispatch<SetStateAction<string>>
}>({ content: '', setContent: () => {} })

export function ToastProvider(props: React.PropsWithChildren) {
  const [content, setContent] = useState('')
  const [show, setShow] = useState(false)

  const toastContextValue = useMemo(() => ({ content, setContent }), [content])

  useEffect(() => {
    if (content) {
      setShow(true)
      setTimeout(() => {
        setShow(false)
        setContent('')
      }, 3000)
    }
  }, [content])

  return (
    <ToastContext.Provider value={toastContextValue}>
      {show &&
        createPortal(
          <div className={cx(classes.container, { [classes.show]: show })}>
            {content}
          </div>,
          document.getElementById('amadeus') as Element,
        )}
      {props.children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const { setContent } = useContext(ToastContext)
  const showToast = (content: string) => {
    setContent(content)
  }
  return { showToast }
}
