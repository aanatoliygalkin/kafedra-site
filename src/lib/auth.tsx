'use client'

/**
 * Состояние входа в систему.
 *
 * В демо-режиме проверяются учётные записи из demo-data и сессия хранится в
 * localStorage. С подключённым Supabase вход выполняет служба аутентификации,
 * а роль пользователя приходит из таблицы profiles. Доступ к данным в обоих
 * случаях ограничивают правила RLS на стороне базы.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { DEMO_MODE } from './data'
import { demoUsers } from './demo-data'
import { notifySession, readSession, writeSession } from './session'
import { isSupabaseConfigured, fetchSessionProfile, signInWithPassword } from './supabase'
import type { Session } from './types'

interface AuthState {
  session: Session | null
  ready: boolean
  demo: boolean
  signIn: (email: string, password: string) => Promise<Session>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readSession()
    setSession(stored)
    setReady(true)
    if (stored && !DEMO_MODE) {
      fetchSessionProfile(stored.access_token).then((profile) => {
        if (!profile) {
          writeSession(null)
          setSession(null)
          notifySession(null)
        }
      })
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (DEMO_MODE) {
      const user = demoUsers.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase()
      )
      if (!user || user.password !== password) {
        throw new Error('Неверный адрес электронной почты или пароль')
      }
      const created: Session = {
        access_token: `demo.${user.id}`,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }
      writeSession(created)
      setSession(created)
      notifySession(created)
      return created
    }

    const created = await signInWithPassword(email.trim(), password)
    writeSession(created)
    setSession(created)
    notifySession(created)
    return created
  }, [])

  const signOut = useCallback(async () => {
    if (!DEMO_MODE && session && isSupabaseConfigured) {
      try {
        const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
        await fetch(`${url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            Authorization: `Bearer ${session.access_token}`,
          },
        })
      } catch {
        /* выход из системы не должен зависеть от сети */
      }
    }
    writeSession(null)
    setSession(null)
    notifySession(null)
  }, [session])

  const value = useMemo<AuthState>(
    () => ({ session, ready, demo: DEMO_MODE, signIn, signOut }),
    [session, ready, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth используется вне AuthProvider')
  }
  return context
}
