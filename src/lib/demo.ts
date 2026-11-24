/**
 * Демо-хранилище.
 *
 * Когда сайт собран без доступа к Supabase (например, демонстрационная
 * публикация на GitHub Pages), данные читаются из модуля demo-data и
 * сохраняются в localStorage браузера. Панель управления в этом режиме
 * работает так же, как с базой: изменения сразу видны на страницах сайта.
 */

import {
  demoCourses,
  demoDocuments,
  demoNews,
  demoPages,
  demoTeachers,
} from './demo-data'
import type {
  Course,
  DocumentItem,
  EntityName,
  ListOptions,
  News,
  Page,
  Teacher,
} from './types'

const STORAGE_KEY = 'kafedra.demo.v1'

interface DemoState {
  news: News[]
  teachers: Teacher[]
  courses: Course[]
  documents: DocumentItem[]
  pages: Page[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function seed(): DemoState {
  return {
    news: clone(demoNews),
    teachers: clone(demoTeachers),
    courses: clone(demoCourses),
    documents: clone(demoDocuments),
    pages: clone(demoPages),
  }
}

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<DemoState>
  return (
    Array.isArray(state.news) &&
    Array.isArray(state.teachers) &&
    Array.isArray(state.courses) &&
    Array.isArray(state.documents) &&
    Array.isArray(state.pages)
  )
}

export function loadDemoState(): DemoState {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = seed()
      saveDemoState(initial)
      return initial
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isDemoState(parsed)) {
      const initial = seed()
      saveDemoState(initial)
      return initial
    }
    return parsed
  } catch {
    return seed()
  }
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* переполнение хранилища — данные останутся только в памяти страницы */
  }
}

/** Сброс демо-данных к исходному состоянию. */
export function resetDemoState(): void {
  saveDemoState(seed())
}

function compare<T>(a: T, b: T): number {
  return String(a).localeCompare(String(b), 'ru')
}

function searchable(entity: EntityName, row: never): string {
  switch (entity) {
    case 'news': {
      const item = row as News
      return `${item.title} ${item.excerpt}`
    }
    case 'teachers': {
      const item = row as Teacher
      return `${item.full_name} ${item.position} ${item.disciplines.join(' ')}`
    }
    case 'courses': {
      const item = row as Course
      return `${item.title} ${item.code}`
    }
    case 'documents': {
      const item = row as DocumentItem
      return `${item.title} ${item.category}`
    }
    default: {
      const item = row as Page
      return `${item.title} ${item.body}`
    }
  }
}

export function demoSorted(entity: EntityName, state: DemoState): unknown[] {
  const rows: unknown[] = state[entity]
  const list = [...rows]
  switch (entity) {
    case 'news':
      list.sort((a, b) =>
        compare((b as News).published_at, (a as News).published_at)
      )
      break
    case 'teachers':
      list.sort((a, b) => (a as Teacher).sort_order - (b as Teacher).sort_order)
      break
    case 'courses':
      list.sort(
        (a, b) =>
          (a as Course).semester - (b as Course).semester ||
          compare((a as Course).title, (b as Course).title)
      )
      break
    case 'documents':
      list.sort((a, b) =>
        compare((b as DocumentItem).updated_at, (a as DocumentItem).updated_at)
      )
      break
    default:
      list.sort((a, b) => compare((a as Page).title, (b as Page).title))
  }
  return list
}

export function demoFilter(
  entity: EntityName,
  rows: unknown[],
  options: ListOptions
): unknown[] {
  let result = rows
  if (options.publishedOnly && entity === 'news') {
    result = result.filter((row) => (row as News).published)
  }
  if (options.category) {
    const category = options.category
    result = result.filter((row) => {
      if (entity === 'news') return (row as News).category === category
      if (entity === 'documents') return (row as DocumentItem).category === category
      return true
    })
  }
  const query = options.search?.trim().toLowerCase()
  if (query) {
    result = result.filter((row) =>
      searchable(entity, row as never).toLowerCase().includes(query)
    )
  }
  return result
}

export function demoList(
  entity: EntityName,
  options: ListOptions = {}
): { items: unknown[]; total: number } {
  const state = loadDemoState()
  const filtered = demoFilter(entity, demoSorted(entity, state), options)
  const total = filtered.length
  const offset = options.offset ?? 0
  const limit = options.limit ?? total
  return { items: filtered.slice(offset, offset + limit), total }
}

export function demoFind(entity: EntityName, id: string): unknown | null {
  const state = loadDemoState()
  const rows: unknown[] = state[entity]
  return rows.find((row) => (row as { id: string }).id === id) ?? null
}

export function demoFindBySlug(entity: EntityName, slug: string): unknown | null {
  const state = loadDemoState()
  const rows: unknown[] = state[entity]
  return (
    rows.find((row) => (row as { slug?: string }).slug === slug) ?? null
  )
}

export function demoSave<T extends { id?: string }>(
  entity: EntityName,
  values: T,
  id?: string | null
): unknown {
  const state = loadDemoState()
  const rows: unknown[] = state[entity]
  const now = new Date().toISOString()

  if (id) {
    const index = rows.findIndex((row) => (row as { id: string }).id === id)
    if (index >= 0) {
      const updated = {
        ...(rows[index] as object),
        ...(values as object),
        id,
        updated_at: now,
      }
      rows[index] = updated
      saveDemoState(state)
      return updated
    }
  }

  const created = {
    ...(values as object),
    id: values.id ?? createId(),
    created_at: now,
    updated_at: now,
  }
  rows.push(created)
  saveDemoState(state)
  return created
}

export function demoRemove(entity: EntityName, id: string): void {
  const state = loadDemoState()
  const rows: unknown[] = state[entity]
  const filtered = rows.filter((row) => (row as { id: string }).id !== id)
  ;(state as unknown as Record<EntityName, unknown[]>)[entity] = filtered
  saveDemoState(state)
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`
}

export interface DemoCounts {
  news: number
  teachers: number
  courses: number
  documents: number
  pages: number
}

export function demoCounts(): DemoCounts {
  const state = loadDemoState()
  return {
    news: state.news.length,
    teachers: state.teachers.length,
    courses: state.courses.length,
    documents: state.documents.length,
    pages: state.pages.length,
  }
}
