import { useContext, useEffect, useRef, useState } from 'react'
import { SettingsModalContext } from './SettingsModal'
import classes from './ChatWindow.module.scss'
import Button from './components/Button'
import MessageBox from './MessageBox'

import { completeChat } from './api'
import { LOCALSTORAGE_API_KEY } from '../constants'

import type { Message } from './types'

enum API_STATUS {
  IDLE,
  WAITING,
  GENERATING,
}

function ChatLoader() {
  return (
    <div className={classes.loader}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

function ChatWindow() {
  const { setApiKeyHint, setShowModal } = useContext(SettingsModalContext)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const isEnterKeyDown = useRef(false)
  const [apiStatus, setApiStatus] = useState(API_STATUS.IDLE)
  const abortController = useRef(new AbortController())

  const handleSendMessage = () => {
    if (!text.length || apiStatus !== API_STATUS.IDLE) return
    if (!localStorage.getItem(LOCALSTORAGE_API_KEY)) {
      setApiKeyHint('Set up your API key to use the app.')
      setShowModal(true)
      return
    }
    setMessages((messages) => [...messages, { role: 'user', content: text }])
    setText('')
  }

  const completeCallback = (content: string) => {
    const lastMessage = { role: 'assistant' as const, content }
    setMessages((messages) => [
      ...messages.slice(0, messages.length - 1),
      lastMessage,
    ])
  }

  useEffect(() => {
    if (messages.length && messages[messages.length - 1].role === 'user') {
      setApiStatus(API_STATUS.WAITING)
      setMessages([...messages, { role: 'assistant', content: <ChatLoader /> }])
      completeChat(messages, completeCallback, abortController.current).finally(
        () => {
          setApiStatus(API_STATUS.IDLE)
        },
      )
    }
  }, [messages])

  return (
    <div className={classes.window}>
      <div className={classes.container}>
        {messages.map((message, index) => (
          <MessageBox
            key={index}
            isBot={message.role !== 'user'}
            message={message.content}
          />
        ))}
        <div className={classes.inputRow}>
          <textarea
            rows={1}
            value={text}
            onChange={(e) => {
              if (isEnterKeyDown.current) return
              setText(e.currentTarget.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                isEnterKeyDown.current = true
                if (e.altKey) {
                  setText((text) => `${text}\n`)
                } else {
                  handleSendMessage()
                }
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                isEnterKeyDown.current = false
              }
            }}
          />
          <Button
            className={classes.button}
            disabled={text.length === 0 || apiStatus !== API_STATUS.IDLE}
            onClick={handleSendMessage}
          >
            Send
          </Button>
          <Button
            className={classes.button}
            onClick={() => {
              abortController.current.abort()
              setMessages([])
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
