import { useRef, useState } from 'react'
import classes from './ChatWindow.module.scss'
import Button from './components/Button'
import MessageBox from './MessageBox'

import type { Message } from './types'

function ChatWindow() {
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const isEnterKeyDown = useRef(false)

  const handleSendMessage = () => {
    setText('')
    setMessages((messages) => [...messages, { role: 'user', content: text }])
  }

  return (
    <div className={classes.window}>
      <div className={classes.container}>
        {messages.map((message) => (
          <MessageBox
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
          <Button className={classes.button}>Reset</Button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
