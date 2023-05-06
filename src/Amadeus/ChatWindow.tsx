import { useCallback, useContext, useEffect, useRef, useState } from 'react'
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
  const abortController = useRef<null | AbortController>(null)
  const scrollContainer = useRef<HTMLDivElement>(null)
  const contentElement = useRef<HTMLDivElement | null>(null)
  const lastContentElementHeight = useRef(0)
  const hasReceivedTheFirstPiece = useRef(false)
  const userHasScrolledAfterReceivingTheFirstPiece = useRef(false)

  const scrollToBottom = () => {
    scrollContainer.current?.scrollTo({
      behavior: 'smooth',
      top: scrollContainer.current.scrollHeight,
    })
  }

  const handleScroll = useCallback(() => {
    if (
      hasReceivedTheFirstPiece.current &&
      !userHasScrolledAfterReceivingTheFirstPiece.current
    ) {
      userHasScrolledAfterReceivingTheFirstPiece.current = true
    }
  }, [])

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
    if (messages.length) {
      const lastMessage = messages[messages.length - 1]

      // Send the network request when user sends a message
      if (messages.length && lastMessage.role === 'user') {
        setApiStatus(API_STATUS.WAITING)
        setMessages([
          ...messages,
          { role: 'assistant', content: <ChatLoader /> },
        ])
        abortController.current = new AbortController()
        completeChat(
          messages,
          completeCallback,
          abortController.current,
        ).finally(() => {
          setApiStatus(API_STATUS.IDLE)
          hasReceivedTheFirstPiece.current = false
        })
      }

      // Scroll to bottom when user just sends a message
      if (
        lastMessage.role === 'assistant' &&
        lastMessage.content !== 'string'
      ) {
        scrollToBottom()
      }

      // Scroll to bottom when receives the first piece of response
      // Scroll to bottom if user hasn't scrolled  after receiving the response or
      // if the distance to bottom is smaller than 30px, if user has scrolled
      // When the last message's height has increased
      if (
        lastMessage.role === 'assistant' &&
        lastMessage.content === 'string' &&
        (!hasReceivedTheFirstPiece.current ||
          !userHasScrolledAfterReceivingTheFirstPiece.current ||
          (contentElement.current?.offsetHeight !==
            lastContentElementHeight.current &&
            scrollContainer.current &&
            scrollContainer.current.scrollHeight -
              scrollContainer.current.offsetHeight <
              scrollContainer.current.scrollTop + 20))
      ) {
        hasReceivedTheFirstPiece.current = true
        lastContentElementHeight.current =
          contentElement.current?.offsetHeight ?? 0
        scrollToBottom()
      }
    }
  }, [messages])

  return (
    <div className={classes.window}>
      <div
        className={classes.scrollContainer}
        onScroll={handleScroll}
        ref={scrollContainer}
      >
        <div className={classes.content} ref={contentElement}>
          {messages.map((message, index) => (
            <MessageBox
              key={index}
              isBot={message.role === 'assistant'}
              message={message.content}
            />
          ))}
        </div>
      </div>
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
            abortController.current?.abort()
            setMessages([])
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

export default ChatWindow
