/** Хранение сессии пользователя в браузере. */

import type { Session } from './types'

const SESSION_KEY = 'kafedra.session.v1'

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (!parsed || typeof parsed.access_token !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function writeSession(session: Session | null): void {
  if (typeof window === 'undefined') return
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(SESSION_KEY)
  }
}

export function sessionToken(): string | null {
  return readSession()?.access_token ?? null
}

/** Уведомление подписчиков об изменении сессии. */
const listeners = new Set<(session: Session | null) => void>()

export function subscribeSession(listener: (session: Session | null) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifySession(session: Session | null): void {
  listeners.forEach((listener) => listener(session))
}
