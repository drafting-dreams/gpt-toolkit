import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ToastContext } from './components/Toast'
import Button from './components/Button'
import classes from './SettingsModal.module.scss'

import type { Dispatch, HTMLProps, SetStateAction } from 'react'

type TextFieldProps = {
  hint?: string
} & HTMLProps<HTMLInputElement>
const TextField = ({ hint, label, name, ...rest }: TextFieldProps) => {
  return (
    <div className={classes.textfield}>
      <label htmlFor={name}>{label}</label>
      <input name={name} {...rest} />
      {!!hint && <div className={classes.hint}>{hint}</div>}
    </div>
  )
}

export const SettingsModalContext = createContext<{
  showModal: boolean
  setApiKeyHint: Dispatch<SetStateAction<string>>
  setShowModal: Dispatch<SetStateAction<boolean>>
}>({ showModal: false, setApiKeyHint: () => {}, setShowModal: () => {} })
const API_KEY_LOCALSTORAGE_KEY = 'api-key'
export const SettingsModalProvider = (props: PropsWithChildren) => {
  const [showModal, setShowModal] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyHint, setApiKeyHint] = useState('')
  const { setContent } = useContext(ToastContext)
  const handleSave = () => {
    const trimmedKey = apiKey.trim()
    localStorage.setItem(API_KEY_LOCALSTORAGE_KEY, trimmedKey)
    setShowModal(false)
    setContent('Api Key is saved!')
  }
  const contextValue = useMemo(
    () => ({ showModal, setApiKeyHint, setShowModal }),
    [showModal],
  )

  useEffect(() => {
    if (showModal) {
      setApiKey(localStorage.getItem(API_KEY_LOCALSTORAGE_KEY) ?? '')
    }
  }, [showModal])

  return (
    <SettingsModalContext.Provider value={contextValue}>
      {props.children}
      {showModal
        ? createPortal(
            <div
              className={classes.backdrop}
              onClick={() => {
                setShowModal(false)
              }}
            >
              <div
                className={classes.container}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <h1>Settings</h1>
                <TextField
                  name='api-key'
                  label='API key'
                  hint={apiKeyHint}
                  onChange={(e) => {
                    setApiKey(e.currentTarget.value)
                    setApiKeyHint('')
                  }}
                  type='password'
                  value={apiKey}
                />
                <Button className={classes.saveButton} onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>,
            document.getElementById('amadeus') as HTMLElement,
          )
        : null}
    </SettingsModalContext.Provider>
  )
}
