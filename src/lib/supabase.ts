/**
 * Клиент Supabase.
 *
 * Вместо официального пакета @supabase/supabase-js используется прямая работа
 * с REST API: так сборка остаётся без дополнительных зависимостей, а все
 * запросы к базе, аутентификации и хранилищу видны в одном файле.
 *
 * Адрес проекта и открытый ключ передаются при сборке:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import type {
  DocumentItem,
  ListOptions,
  News,
  Profile,
  Role,
  Session,
  Teacher,
} from './types'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/** Задан ли проект Supabase: если нет, сайт работает в демо-режиме. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY)

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase не настроен: проверьте переменные окружения')
  }
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const body: unknown = text ? JSON.parse(text) : null
  if (!response.ok) {
    const error = body as { message?: string; error_description?: string }
    const message =
      error?.message || error?.error_description || `Ошибка запроса (${response.status})`
    throw new Error(message)
  }
  return body as T
}

/* ------------------------------------------------------------ выборка данных */

function buildQuery(
  table: string,
  options: ListOptions,
  order: string,
  withCount: boolean
): { url: string; headers: Record<string, string> } {
  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('order', order)
  if (options.publishedOnly) params.set('published', 'eq.true')
  if (options.category) params.set('category', `eq.${options.category}`)
  if (options.search?.trim()) {
    const value = options.search.trim()
    params.set('or', `(title.ilike.*${value}*,excerpt.ilike.*${value}*)`)
  }
  const limit = options.limit ?? 200
  const offset = options.offset ?? 0
  params.set('limit', String(limit))
  params.set('offset', String(offset))

  const headers: Record<string, string> = {}
  if (withCount) headers['Prefer'] = 'count=exact'

  return {
    url: `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`,
    headers,
  }
}

function totalFromRange(header: string | null, fallback: number): number {
  if (!header) return fallback
  const [, total] = header.split('/')
  const parsed = Number(total)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function restList<T>(
  table: string,
  options: ListOptions,
  order: string,
  withCount = false,
  token?: string | null
): Promise<{ items: T[]; total: number }> {
  ensureConfigured()
  const { url, headers } = buildQuery(table, options, order, withCount)
  const response = await fetch(url, { headers: { ...authHeaders(token), ...headers } })
  const items = await parse<T[]>(response)
  const total = withCount
    ? totalFromRange(response.headers.get('content-range'), items.length)
    : items.length
  return { items, total }
}

export async function restOne<T>(
  table: string,
  column: string,
  value: string
): Promise<T | null> {
  ensureConfigured()
  const params = new URLSearchParams()
  params.set('select', '*')
  params.set(column, `eq.${value}`)
  params.set('limit', '1')
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`, {
    headers: authHeaders(),
  })
  const rows = await parse<T[]>(response)
  return rows[0] ?? null
}

export async function restCount(table: string): Promise<number> {
  ensureConfigured()
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    headers: { ...authHeaders(), Prefer: 'count=exact', Range: '0-0' },
  })
  const rows = await parse<unknown[]>(response)
  return totalFromRange(response.headers.get('content-range'), rows.length)
}

/* ------------------------------------------------------------- запись данных */

export async function restInsert<T>(
  table: string,
  values: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  ensureConfigured()
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...authHeaders(token), Prefer: 'return=representation' },
    body: JSON.stringify(values),
  })
  const rows = await parse<T[]>(response)
  return rows[0]
}

export async function restUpdate<T>(
  table: string,
  id: string,
  values: Record<string, unknown>,
  token?: string | null
): Promise<T | null> {
  ensureConfigured()
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { ...authHeaders(token), Prefer: 'return=representation' },
      body: JSON.stringify(values),
    }
  )
  const rows = await parse<T[]>(response)
  return rows[0] ?? null
}

export async function restDelete(
  table: string,
  id: string,
  token?: string | null
): Promise<void> {
  ensureConfigured()
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: authHeaders(token) }
  )
  if (!response.ok) await parse<unknown>(response)
}

/* -------------------------------------------------------- вход и профиль */

interface TokenResponse {
  access_token: string
  user: { id: string; email?: string }
}

interface ProfileRow {
  id: string
  email: string
  full_name: string
  role: Role
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<Session> {
  ensureConfigured()
  const response = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    }
  )
  const data = await parse<TokenResponse>(response)
  const profile = await fetchProfile(data.access_token, data.user.id).catch(() => null)
  return {
    access_token: data.access_token,
    email: profile?.email ?? data.user.email ?? email,
    full_name: profile?.full_name ?? email,
    role: profile?.role ?? 'staff',
  }
}

export async function fetchProfile(
  token: string,
  userId: string
): Promise<ProfileRow | null> {
  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('id', `eq.${userId}`)
  params.set('limit', '1')
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?${params.toString()}`, {
    headers: authHeaders(token),
  })
  const rows = await parse<ProfileRow[]>(response)
  return rows[0] ?? null
}

/** Проверка сохранённой сессии: возвращает профиль или null. */
export async function fetchSessionProfile(token: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders(token),
    })
    const user = await parse<{ id: string; email?: string }>(response)
    const profile = await fetchProfile(token, user.id)
    return {
      id: user.id,
      email: profile?.email ?? user.email ?? '',
      full_name: profile?.full_name ?? user.email ?? '',
      role: profile?.role ?? 'staff',
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------- типы ответов */

export interface NewsRow extends News {}
export interface TeacherRow extends Teacher {}
export interface DocumentRow extends DocumentItem {}
