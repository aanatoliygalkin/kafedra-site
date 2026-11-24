/** Типы данных сайта. Соответствуют таблицам базы Supabase. */

export type Role = 'admin' | 'staff' | 'guest'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
}

export type NewsCategory =
  | 'Учёба'
  | 'Студенты'
  | 'Расписание'
  | 'Наука'
  | 'Приём'

export interface News {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: NewsCategory
  cover_url: string | null
  published: boolean
  published_at: string
  created_at: string
}

export interface Teacher {
  id: string
  full_name: string
  position: string
  degree: string
  email: string
  phone: string
  photo_url: string | null
  disciplines: string[]
  experience_years: number
  is_head: boolean
  sort_order: number
}

export interface Course {
  id: string
  code: string
  title: string
  semester: number
  hours: number
  credits: number
  form: string
  description: string
  teacher_id: string | null
  teacher_name?: string
}

export type DocumentCategory =
  | 'Учебные планы'
  | 'Методические материалы'
  | 'Бланки'
  | 'Приказы'

export interface DocumentItem {
  id: string
  title: string
  category: DocumentCategory
  file_url: string
  file_size: number
  version: string
  updated_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  body: string
  updated_at: string
}

/** Имена сущностей, одинаковые для демо-режима и таблиц базы. */
export type EntityName = 'news' | 'teachers' | 'courses' | 'documents' | 'pages'

export interface Session {
  access_token: string
  email: string
  full_name: string
  role: Role
}

export interface ListOptions {
  limit?: number
  offset?: number
  category?: string
  search?: string
  publishedOnly?: boolean
}
