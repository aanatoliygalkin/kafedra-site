/**
 * Единый слой доступа к данным.
 *
 * Страницы и компоненты не знают, откуда приходят записи: из таблиц Supabase
 * или из демо-хранилища браузера. Выбор делает этот модуль по наличию
 * переменных окружения Supabase.
 */

import {
  demoCounts,
  demoCreateProfile,
  demoDeleteProfile,
  demoFind,
  demoFindBySlug,
  demoList,
  demoProfiles,
  demoRemove,
  demoSave,
  demoUpdateProfile,
} from './demo'
import { sessionToken } from './session'
import {
  isSupabaseConfigured,
  restCount,
  restDelete,
  restInsert,
  restList,
  restOne,
  restUpdate,
} from './supabase'
import type {
  Course,
  DocumentItem,
  EntityName,
  ListOptions,
  News,
  Page,
  Profile,
  Role,
  Teacher,
} from './types'

export const DEMO_MODE = !isSupabaseConfigured

const TABLE: Record<EntityName, string> = {
  news: 'news',
  teachers: 'teachers',
  courses: 'courses',
  documents: 'documents',
  pages: 'pages',
}

const ORDER: Record<EntityName, string> = {
  news: 'published_at.desc',
  teachers: 'sort_order.asc',
  courses: 'semester.asc',
  documents: 'updated_at.desc',
  pages: 'title.asc',
}

/* ---------------------------------------------------------------- чтение */

export async function listNews(
  options: ListOptions = {}
): Promise<{ items: News[]; total: number }> {
  const publishedOnly = options.publishedOnly ?? true
  if (DEMO_MODE) {
    const { items, total } = demoList('news', { ...options, publishedOnly })
    return { items: items as News[], total }
  }
  return restList<News>(
    TABLE.news,
    { ...options, publishedOnly },
    ORDER.news,
    true,
    sessionToken()
  )
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  if (DEMO_MODE) return demoFindBySlug('news', slug) as News | null
  return restOne<News>(TABLE.news, 'slug', slug)
}

export async function listTeachers(options: ListOptions = {}): Promise<Teacher[]> {
  if (DEMO_MODE) {
    const { items } = demoList('teachers', options)
    return items as Teacher[]
  }
  const { items } = await restList<Teacher>(TABLE.teachers, options, ORDER.teachers)
  return items
}

export async function listCourses(options: ListOptions = {}): Promise<Course[]> {
  const [courses, teachers] = await Promise.all([
    DEMO_MODE
      ? Promise.resolve(demoList('courses', options).items as Course[])
      : restList<Course>(TABLE.courses, options, ORDER.courses).then((r) => r.items),
    listTeachers(),
  ])
  const names = new Map(teachers.map((teacher) => [teacher.id, teacher.full_name]))
  return courses.map((course) => ({
    ...course,
    teacher_name: course.teacher_id ? names.get(course.teacher_id) ?? '' : '',
  }))
}

export async function listDocuments(
  options: ListOptions = {}
): Promise<DocumentItem[]> {
  if (DEMO_MODE) {
    const { items } = demoList('documents', options)
    return items as DocumentItem[]
  }
  const { items } = await restList<DocumentItem>(TABLE.documents, options, ORDER.documents)
  return items
}

export async function listPages(options: ListOptions = {}): Promise<Page[]> {
  if (DEMO_MODE) {
    const { items } = demoList('pages', options)
    return items as Page[]
  }
  const { items } = await restList<Page>(TABLE.pages, options, ORDER.pages)
  return items
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  if (DEMO_MODE) return demoFindBySlug('pages', slug) as Page | null
  return restOne<Page>(TABLE.pages, 'slug', slug)
}

/* ------------------------------------------------- универсальная выборка */

/**
 * Список записей любого раздела — используется панелью управления, где
 * нужны все записи, включая неопубликованные новости.
 */
export async function listEntity<T>(
  type: EntityName,
  options: ListOptions = {}
): Promise<{ items: T[]; total: number }> {
  if (DEMO_MODE) {
    const { items, total } = demoList(type, options)
    return { items: items as T[], total }
  }
  const result = await restList<T>(TABLE[type], options, ORDER[type], true)
  return { items: result.items, total: result.total }
}

/** Одна запись по идентификатору. */
export async function getEntity<T>(
  type: EntityName,
  id: string
): Promise<T | null> {
  if (DEMO_MODE) return demoFind(type, id) as T | null
  return restOne<T>(TABLE[type], 'id', id)
}

/* ------------------------------------------------------------ запись */

export interface SavePayload {
  type: EntityName
  id?: string | null
  values: Record<string, unknown>
}

export async function saveEntity({ type, id, values }: SavePayload): Promise<void> {
  if (DEMO_MODE) {
    demoSave(type, values as { id?: string }, id)
    return
  }
  const token = sessionToken()
  if (id) {
    await restUpdate(TABLE[type], id, values, token)
  } else {
    await restInsert(TABLE[type], values, token)
  }
}

export async function deleteEntity(type: EntityName, id: string): Promise<void> {
  if (DEMO_MODE) {
    demoRemove(type, id)
    return
  }
  await restDelete(TABLE[type], id, sessionToken())
}

/* ---------------------------------------------------- учётные записи */

/** Учётные записи сотрудников. Читают сотрудники и администратор, изменяет администратор. */
export async function listProfiles(): Promise<Profile[]> {
  if (DEMO_MODE) return demoProfiles()
  const { items } = await restList<Profile>(
    'profiles',
    {},
    'full_name.asc',
    false,
    sessionToken()
  )
  return items
}

/** Имена авторов записей: идентификатор профиля → ФИО. */
export async function listAuthorNames(): Promise<Map<string, string>> {
  try {
    const profiles = await listProfiles()
    return new Map(profiles.map((profile) => [profile.id, profile.full_name]))
  } catch {
    return new Map()
  }
}

export async function updateProfileRole(id: string, role: Role): Promise<void> {
  if (DEMO_MODE) {
    demoUpdateProfile(id, { role })
    return
  }
  await restUpdate('profiles', id, { role }, sessionToken())
}

export async function createProfile(input: {
  email: string
  full_name: string
  password: string
  role: Role
}): Promise<void> {
  if (DEMO_MODE) {
    demoCreateProfile(input)
    return
  }
  throw new Error('В рабочей базе учётные записи создаются в панели Supabase')
}

export async function deleteProfile(id: string): Promise<void> {
  if (DEMO_MODE) {
    demoDeleteProfile(id)
    return
  }
  throw new Error('Удаление учётной записи выполняется в панели Supabase')
}

/* ------------------------------------------------------------ статистика */
export interface Counts {
  news: number
  teachers: number
  courses: number
  documents: number
  pages: number
}

export async function loadCounts(): Promise<Counts> {
  if (DEMO_MODE) return demoCounts()
  const [news, teachers, courses, documents, pages] = await Promise.all([
    restCount(TABLE.news),
    restCount(TABLE.teachers),
    restCount(TABLE.courses),
    restCount(TABLE.documents),
    restCount(TABLE.pages),
  ])
  return { news, teachers, courses, documents, pages }
}
