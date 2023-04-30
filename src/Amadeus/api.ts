import axios from 'axios'

import { LOCALSTORAGE_API_KEY } from '../constants'

import type { Message } from './types'

export function completeChat(
  messages: Message[],
  callback: (content: string) => void,
) {
  const apiKey = localStorage.getItem(LOCALSTORAGE_API_KEY)
  return axios.post(
    '/api/chat',
    { apiKey, messages },
    {
      responseType: 'stream',
      onDownloadProgress: (progress) => {
        if (typeof progress.event?.currentTarget?.responseText === 'string')
          callback(progress.event.currentTarget.responseText)
      },
    },
  )
}

export function fetchChat(messages: Message[]) {
  const apiKey = localStorage.getItem(LOCALSTORAGE_API_KEY)
  return fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ apiKey, messages }),
  })
}
