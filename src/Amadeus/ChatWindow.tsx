import { useContext, useEffect, useRef, useState } from 'react'
import { SettingsModalContext } from './SettingsModal'
import classes from './ChatWindow.module.scss'
import Button from './components/Button'
import MessageBox from './MessageBox'

import { completeChat } from './api'
import { LOCALSTORAGE_API_KEY } from '../constants'

import type { Message } from './types'

function ChatWindow() {
  const { setApiKeyHint, setShowModal } = useContext(SettingsModalContext)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const isEnterKeyDown = useRef(false)

  const handleSendMessage = () => {
    if (!text.length) return
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
    setMessages((messages) => {
      if (messages[messages.length - 1].role !== 'assistant') {
        return [...messages, lastMessage]
      }
      return [...messages.slice(0, messages.length - 1), lastMessage]
    })
  }

  useEffect(() => {
    if (messages.length && messages[messages.length - 1].role === 'user') {
      completeChat(messages, completeCallback)
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
          <Button className={classes.button} onClick={handleSendMessage}>
            Send
          </Button>
          <Button
            className={classes.button}
            onClick={() => {
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
