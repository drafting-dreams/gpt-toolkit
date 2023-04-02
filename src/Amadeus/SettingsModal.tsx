import { createPortal } from 'react-dom'
import Button from './components/Button'
import classes from './SettingsModal.module.scss'

import { HTMLProps, useState } from 'react'

type TextFieldProps = {
  hint?: string
} & HTMLProps<HTMLInputElement>
const TextField = ({ hint, label, name, ...rest }: TextFieldProps) => {
  return (
    <div className={classes.textfield}>
      <label htmlFor={name}>{label}</label>
      <input name={name} {...rest} />
      {!!hint && <div>{hint}</div>}
    </div>
  )
}

type Props = {
  isOpen: boolean
  onClose: () => void
}
const SettingsModal = ({ isOpen, onClose }: Props) => {
  const [apiKey, setApiKey] = useState('')
  const handleSave = () => {
    localStorage.setItem('api-key', apiKey)
    onClose()
  }

  return isOpen
    ? createPortal(
        <div className={classes.backdrop} onClick={onClose}>
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
              onChange={(e) => {
                setApiKey(e.currentTarget.value)
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
    : null
}

export default SettingsModal
