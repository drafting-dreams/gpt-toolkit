import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ToastContext } from './components/Toast'
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

type UiMessage = Message & { isNotSent?: boolean }

function ChatWindow() {
  const { setContent: setToast } = useContext(ToastContext)
  const { setApiKeyHint, setShowModal } = useContext(SettingsModalContext)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<UiMessage[]>([])
  const isEnterKeyDown = useRef(false)
  const [apiStatus, setApiStatus] = useState(API_STATUS.IDLE)
  const abortController = useRef<null | AbortController>(null)
  const scrollContainer = useRef<HTMLDivElement>(null)
  const contentElement = useRef<HTMLDivElement | null>(null)
  const lastContentElementHeight = useRef(0)
  const hasReceivedTheFirstPiece = useRef(false)
  const userHasScrolledAfterReceivingTheFirstPiece = useRef(false)
  const dialogContext = useRef('')
  const contextRangeIndex = useRef(0)
  const responseOffset = useRef(0)
  const isImeMode = useRef(false)

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
    const startMark = '-----Context Start-----'
    const endMark = '-----Context End-----'
    if (content.startsWith(startMark)) {
      const endIndex = content.indexOf(endMark)
      dialogContext.current = content.substring(startMark.length, endIndex)
      // The last message's index that the context includes. The server will summarize a context if the dialog is too long.
      // This index is an right open interval of the message range, which means `messages.length - 1` is actually not included in the context returned.
      contextRangeIndex.current = messages.length - 1
      responseOffset.current = endIndex + endMark.length
    }
    const lastMessage = {
      role: 'assistant' as const,
      content: responseOffset.current
        ? content.substring(responseOffset.current)
        : content,
    }
    setMessages((messages) => [
      ...messages.slice(0, messages.length - 1),
      lastMessage,
    ])
  }

  useEffect(() => {
    if (messages.length) {
      const lastMessage = messages[messages.length - 1]

      // Send the network request when user sends a message
      if (
        messages.length &&
        lastMessage.role === 'user' &&
        !lastMessage.isNotSent
      ) {
        setApiStatus(API_STATUS.WAITING)
        setMessages([
          ...messages,
          { role: 'assistant', content: <ChatLoader /> },
        ])
        abortController.current = new AbortController()
        const setMessageNotSent = (messages: UiMessage[]) => [
          ...messages.slice(0, messages.length - 2),
          { ...messages[messages.length - 2], isNotSent: true },
        ]
        completeChat(
          messages
            .slice(contextRangeIndex.current)
            .filter((message) => !message.isNotSent),
          dialogContext.current,
          completeCallback,
          abortController.current,
        )
          .then(undefined, (axiosError) => {
            try {
              const error = JSON.parse(axiosError.response.data)

              if (error.errorCode === 2) {
                setMessages(setMessageNotSent)
                setApiKeyHint(error.message)
                setShowModal(true)
              } else if (error.errorCode) {
                setMessages(setMessageNotSent)
                setToast(error.message)
              }
            } catch (error: any) {
              setMessages(setMessageNotSent)
              setToast(error.toString())
            }
          })
          .finally(() => {
            setApiStatus(API_STATUS.IDLE)
            hasReceivedTheFirstPiece.current = false
            responseOffset.current = 0
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
              showError={!!message.isNotSent}
              resend={
                index === messages.length - 1
                  ? () => {
                      setMessages([
                        ...messages.slice(0, messages.length - 1),
                        {
                          role: 'user',
                          content: messages[messages.length - 1].content,
                        },
                      ])
                    }
                  : undefined
              }
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
            if (isImeMode.current) return

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
          onCompositionStart={() => {
            isImeMode.current = true
          }}
          onCompositionEnd={() => {
            isImeMode.current = false
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
            dialogContext.current = ''
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
