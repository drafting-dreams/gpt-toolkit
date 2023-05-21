import axios from 'axios'

import { LOCALSTORAGE_API_KEY } from '../constants'

import type { Message } from './types'

export function completeChat(
  messages: Message[],
  context: string,
  callback: (content: string) => void,
  controller: AbortController,
) {
  const apiKey = localStorage.getItem(LOCALSTORAGE_API_KEY)
  return axios.post(
    '/api/chat',
    context ? { apiKey, context, messages } : { apiKey, messages },
    {
      responseType: 'stream',
      onDownloadProgress: (progress) => {
        if (typeof progress.event?.currentTarget?.responseText === 'string')
          callback(progress.event.currentTarget.responseText)
      },
      signal: controller.signal,
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
