'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { TextSkeleton } from '@/components/Skeleton'
import { useAuth } from '@/lib/auth'
import { deleteEntity, getEntity, listTeachers, saveEntity } from '@/lib/data'
import { slugify } from '@/lib/format'
import { canEdit } from '@/lib/permissions'
import type { EntityName, Teacher } from '@/lib/types'

type FieldKind = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'teacher'

interface Field {
  name: string
  label: string
  kind: FieldKind
  options?: string[]
  required?: boolean
  full?: boolean
  hint?: string
}

const TITLES: Record<EntityName, string> = {
  news: 'Новость',
  teachers: 'Преподаватель',
  courses: 'Дисциплина',
  documents: 'Документ',
  pages: 'Страница',
}

const LIST_HREF: Record<EntityName, string> = {
  news: '/admin/news/',
  teachers: '/admin/teachers/',
  courses: '/admin/courses/',
  documents: '/admin/documents/',
  pages: '/admin/pages/',
}

const PUBLISH_CATEGORIES = ['Учёба', 'Студенты', 'Расписание', 'Наука', 'Приём']
const DOCUMENT_CATEGORIES = [
  'Учебные планы',
  'Методические материалы',
  'Бланки',
  'Приказы',
]

const FIELDS: Record<EntityName, Field[]> = {
  news: [
    { name: 'title', label: 'Заголовок', kind: 'text', required: true, full: true },
    { name: 'slug', label: 'Адрес записи', kind: 'text', hint: 'Можно оставить пустым — будет создан из заголовка' },
    { name: 'category', label: 'Раздел', kind: 'select', options: PUBLISH_CATEGORIES },
    { name: 'published_at', label: 'Дата публикации', kind: 'date' },
    { name: 'published', label: 'Опубликовать на сайте', kind: 'checkbox' },
    { name: 'cover_url', label: 'Ссылка на обложку', kind: 'text', hint: 'Необязательно: адрес картинки в хранилище' },
    { name: 'excerpt', label: 'Краткое описание', kind: 'textarea', full: true },
    { name: 'body', label: 'Текст новости', kind: 'textarea', required: true, full: true, hint: 'Абзацы разделяются пустой строкой' },
  ],
  teachers: [
    { name: 'full_name', label: 'Фамилия, имя, отчество', kind: 'text', required: true, full: true },
    { name: 'position', label: 'Должность', kind: 'text', required: true },
    { name: 'degree', label: 'Учёная степень, звание', kind: 'text' },
    { name: 'email', label: 'Электронная почта', kind: 'text' },
    { name: 'phone', label: 'Телефон', kind: 'text' },
    { name: 'disciplines', label: 'Дисциплины', kind: 'text', full: true, hint: 'Перечислите через запятую' },
    { name: 'experience_years', label: 'Стаж, лет', kind: 'number' },
    { name: 'sort_order', label: 'Порядок вывода', kind: 'number' },
    { name: 'is_head', label: 'Заведующий кафедрой', kind: 'checkbox' },
    { name: 'photo_url', label: 'Ссылка на фотографию', kind: 'text' },
  ],
  courses: [
    { name: 'code', label: 'Код дисциплины', kind: 'text', required: true },
    { name: 'title', label: 'Название', kind: 'text', required: true },
    { name: 'semester', label: 'Семестр', kind: 'number' },
    { name: 'hours', label: 'Всего часов', kind: 'number' },
    { name: 'credits', label: 'Зачётные единицы', kind: 'number' },
    { name: 'form', label: 'Форма обучения', kind: 'select', options: ['Очная', 'Очно-заочная'] },
    { name: 'teacher_id', label: 'Преподаватель', kind: 'teacher', full: true },
    { name: 'description', label: 'Описание', kind: 'textarea', full: true },
  ],
  documents: [
    { name: 'title', label: 'Название документа', kind: 'text', required: true, full: true },
    { name: 'category', label: 'Категория', kind: 'select', options: DOCUMENT_CATEGORIES },
    { name: 'version', label: 'Версия', kind: 'text' },
    { name: 'file_url', label: 'Ссылка на файл', kind: 'text', required: true, full: true, hint: 'Например /files/uchebnyy-plan.pdf или адрес файла в Supabase Storage' },
    { name: 'file_size', label: 'Размер, байт', kind: 'number' },
    { name: 'updated_at', label: 'Дата обновления', kind: 'date' },
  ],
  pages: [
    { name: 'title', label: 'Заголовок страницы', kind: 'text', required: true, full: true },
    { name: 'slug', label: 'Адрес страницы', kind: 'text', required: true, hint: 'Латиницей, например about' },
    { name: 'body', label: 'Текст', kind: 'textarea', required: true, full: true, hint: 'Абзацы разделяются пустой строкой' },
  ],
}

type FormState = Record<string, string | boolean>

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function defaults(type: EntityName): FormState {
  switch (type) {
    case 'news':
      return {
        title: '',
        slug: '',
        category: 'Учёба',
        published_at: today(),
        published: true,
        cover_url: '',
        excerpt: '',
        body: '',
      }
    case 'teachers':
      return {
        full_name: '',
        position: '',
        degree: '',
        email: '',
        phone: '',
        disciplines: '',
        experience_years: '0',
        sort_order: '99',
        is_head: false,
        photo_url: '',
      }
    case 'courses':
      return {
        code: '',
        title: '',
        semester: '1',
        hours: '72',
        credits: '2',
        form: 'Очная',
        teacher_id: '',
        description: '',
      }
    case 'documents':
      return {
        title: '',
        category: 'Учебные планы',
        version: '2026',
        file_url: '',
        file_size: '0',
        updated_at: today(),
      }
    default:
      return { title: '', slug: '', body: '' }
  }
}

function toForm(type: EntityName, row: Record<string, unknown>): FormState {
  const result = defaults(type)
  Object.keys(result).forEach((key) => {
    const value = row[key]
    if (typeof value === 'boolean') {
      result[key] = value
    } else if (Array.isArray(value)) {
      result[key] = value.join(', ')
    } else if (value !== null && value !== undefined) {
      if (key.endsWith('_at')) {
        result[key] = String(value).slice(0, 10)
      } else {
        result[key] = String(value)
      }
    }
  })
  return result
}

function toPayload(type: EntityName, form: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  const numberKeys = ['experience_years', 'sort_order', 'semester', 'hours', 'credits', 'file_size']

  Object.entries(form).forEach(([key, value]) => {
    if (numberKeys.includes(key)) {
      payload[key] = Number(value) || 0
      return
    }
    if (key === 'published' || key === 'is_head') {
      payload[key] = Boolean(value)
      return
    }
    if (key === 'disciplines') {
      payload[key] = String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      return
    }
    if (key === 'teacher_id') {
      payload[key] = value ? String(value) : null
      return
    }
    if (key === 'published_at' || key === 'updated_at') {
      const text = String(value || '')
      payload[key] = text ? `${text}T09:00:00.000Z` : new Date().toISOString()
      return
    }
    payload[key] = typeof value === 'string' && value.trim() === '' && key !== 'title' ? null : value
  })

  if (type === 'news' || type === 'pages') {
    const title = String(form.title || '')
    if (!payload.slug) payload.slug = slugify(title)
  }
  if (type === 'news') {
    payload.published_at = String(payload.published_at ?? new Date().toISOString())
  }
  return payload
}

export function EditView() {
  const params = useSearchParams()
  const router = useRouter()
  const { session } = useAuth()
  const type = (params.get('type') ?? 'news') as EntityName
  const id = params.get('id')
  const allowed = canEdit(type, session?.role)

  const [form, setForm] = useState<FormState | null>(id ? null : defaults(type))
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    listTeachers()
      .then((items) => {
        if (alive) setTeachers(items)
      })
      .catch(() => setTeachers([]))
    if (id) {
      getEntity<Record<string, unknown>>(type, id)
        .then((row) => {
          if (!alive) return
          if (!row) {
            setError('Запись не найдена')
            setForm(defaults(type))
            return
          }
          setForm(toForm(type, row))
        })
        .catch((reason: Error) => {
          if (alive) setError(reason.message)
        })
    }
    return () => {
      alive = false
    }
  }, [id, type])

  const fields = useMemo(() => FIELDS[type] ?? FIELDS.pages, [type])

  const set = (name: string, value: string | boolean) => {
    setForm((current) => (current ? { ...current, [name]: value } : current))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return
    const missing = fields.filter(
      (field) => field.required && !String(form[field.name] ?? '').trim()
    )
    if (missing.length > 0) {
      setError(`Заполните обязательные поля: ${missing.map((field) => field.label).join(', ')}`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const values = toPayload(type, form)
      if (type === 'news' && !id && session?.id) {
        values.created_by = session.id
      }
      await saveEntity({ type, id: id ?? null, values })
      router.push(LIST_HREF[type] ?? '/admin/')
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id) return
    if (!window.confirm('Удалить запись? Действие нельзя отменить.')) return
    setSaving(true)
    try {
      await deleteEntity(type, id)
      router.push(LIST_HREF[type] ?? '/admin/')
    } catch (reason) {
      setError((reason as Error).message)
      setSaving(false)
    }
  }

  if (!allowed) {
    return (
      <div className="empty">
        Недостаточно прав: этот раздел изменяет только администратор.{' '}
        <Link href={LIST_HREF[type] ?? '/admin/'}>Вернуться к списку</Link>.
      </div>
    )
  }

  if (!form) {
    return (
      <div className="form-card">
        <TextSkeleton />
      </div>
    )
  }

  return (
    <>
      <div className="admin-head">
        <h1>
          {id ? 'Изменить' : 'Добавить'}: {TITLES[type] ?? 'запись'}
        </h1>
        <Link className="btn" href={LIST_HREF[type] ?? '/admin/'}>
          ← К списку
        </Link>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          {fields.map((field) => {
            const value = form[field.name]
            const className = `field${field.full ? ' full' : ''}`

            if (field.kind === 'checkbox') {
              return (
                <label className={`checkbox${field.full ? ' full' : ''}`} key={field.name}>
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => set(field.name, event.target.checked)}
                  />
                  {field.label}
                </label>
              )
            }

            return (
              <div className={className} key={field.name}>
                <label htmlFor={`f-${field.name}`}>{field.label}</label>
                {field.kind === 'textarea' ? (
                  <textarea
                    id={`f-${field.name}`}
                    className="textarea"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                ) : null}
                {field.kind === 'select' ? (
                  <select
                    id={`f-${field.name}`}
                    className="select"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : null}
                {field.kind === 'teacher' ? (
                  <select
                    id={`f-${field.name}`}
                    className="select"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  >
                    <option value="">— не выбран —</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                ) : null}
                {field.kind === 'number' ? (
                  <input
                    id={`f-${field.name}`}
                    className="input"
                    type="number"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                ) : null}
                {field.kind === 'date' ? (
                  <input
                    id={`f-${field.name}`}
                    className="input"
                    type="date"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                ) : null}
                {field.kind === 'text' ? (
                  <input
                    id={`f-${field.name}`}
                    className="input"
                    type="text"
                    value={String(value ?? '')}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                ) : null}
                {field.hint ? <span className="hint">{field.hint}</span> : null}
              </div>
            )
          })}
        </div>

        <div className="form-actions">
          <button className="btn btn-solid" type="submit" disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <Link className="btn" href={LIST_HREF[type] ?? '/admin/'}>
            Отмена
          </Link>
          {id ? (
            <button
              className="btn btn-danger"
              type="button"
              onClick={remove}
              disabled={saving}
              style={{ marginLeft: 'auto' }}
            >
              Удалить запись
            </button>
          ) : null}
        </div>
      </form>
    </>
  )
}
