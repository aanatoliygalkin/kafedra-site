'use client'

import { useEffect, useMemo, useState } from 'react'

import { PageHead } from '@/components/PageHead'
import { RowsSkeleton } from '@/components/Skeleton'
import { listDocuments } from '@/lib/data'
import { formatBytes, formatShortDate, plural } from '@/lib/format'
import type { DocumentCategory, DocumentItem } from '@/lib/types'
import { withBase } from '@/lib/withBase'

const CATEGORIES: Array<DocumentCategory | 'Все'> = [
  'Все',
  'Учебные планы',
  'Методические материалы',
  'Бланки',
  'Приказы',
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<DocumentCategory | 'Все'>('Все')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    listDocuments()
      .then((items) => {
        if (alive) setDocuments(items)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    if (!documents) return []
    const query = search.trim().toLowerCase()
    return documents.filter((document) => {
      if (category !== 'Все' && document.category !== category) return false
      if (!query) return true
      return `${document.title} ${document.category}`.toLowerCase().includes(query)
    })
  }, [documents, category, search])

  const grouped = useMemo(() => {
    const map = new Map<string, DocumentItem[]>()
    visible.forEach((document) => {
      const list = map.get(document.category) ?? []
      list.push(document)
      map.set(document.category, list)
    })
    // группы выводятся в порядке разделов, а не в порядке появления записей
    return CATEGORIES.filter((item) => item !== 'Все')
      .filter((item) => map.has(item))
      .map((item) => [item, map.get(item) ?? []] as [string, DocumentItem[]])
  }, [visible])

  return (
    <div className="wrap" style={{ display: 'grid', gap: 20 }}>
      <PageHead
        title="Документы"
        subtitle={
          documents
            ? `${documents.length} ${plural(documents.length, [
                'документ',
                'документа',
                'документов',
              ])} в архиве`
            : 'Архив документов кафедры'
        }
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Документы' }]}
      />

      <div className="filters">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${category === item ? ' on' : ''}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
        <div className="grow" />
        <input
          className="input search"
          type="search"
          placeholder="Поиск по названию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Поиск документов"
        />
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {!documents && !error ? <RowsSkeleton count={4} /> : null}

      {documents && visible.length === 0 ? (
        <div className="empty">Документы по выбранным условиям не найдены.</div>
      ) : null}

      {grouped.map(([group, items]) => (
        <section key={group} style={{ display: 'grid', gap: 10 }}>
          <h2 className="sect" style={{ fontSize: 16 }}>
            {group}
          </h2>
          {items.map((document) => (
            <a
              className="doc-row"
              key={document.id}
              href={withBase(document.file_url)}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="doc-icon">PDF</span>
              <span className="doc-main">
                <b>{document.title}</b>
                <span>
                  Версия: {document.version} · обновлён {formatShortDate(document.updated_at)}
                </span>
              </span>
              <span className="doc-side">
                <span>{formatBytes(document.file_size)}</span>
                <span className="tag">Скачать</span>
              </span>
            </a>
          ))}
        </section>
      ))}
    </div>
  )
}
