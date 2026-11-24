'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { loadCounts, listNews, type Counts } from '@/lib/data'
import { formatDate } from '@/lib/format'
import type { News } from '@/lib/types'

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [news, setNews] = useState<News[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([loadCounts(), listNews({ limit: 5, publishedOnly: false })])
      .then(([countsResult, newsResult]) => {
        if (!alive) return
        setCounts(countsResult)
        setNews(newsResult.items)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <div className="admin-head">
        <h1>Обзор</h1>
        <Link className="btn btn-solid" href="/admin/edit?type=news">
          + Новая новость
        </Link>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="stat-grid">
        {[
          { key: 'news', label: 'новостей', href: '/admin/news/' },
          { key: 'teachers', label: 'преподавателей', href: '/admin/teachers/' },
          { key: 'courses', label: 'дисциплин', href: '/admin/courses/' },
          { key: 'documents', label: 'документов', href: '/admin/documents/' },
        ].map((item) => (
          <Link className="stat" href={item.href} key={item.key}>
            <b>{counts ? counts[item.key as keyof Counts] : '—'}</b>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="form-card">
        <h2 className="sect" style={{ fontSize: 16 }}>
          Последние новости
        </h2>
        {!news ? <div className="skeleton" style={{ height: 120 }} /> : null}
        {news && news.length === 0 ? <div className="empty">Новостей пока нет.</div> : null}
        {news && news.length > 0 ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Заголовок</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>
                      {item.published ? (
                        <span className="tag g">Опубликована</span>
                      ) : (
                        <span className="tag y">Черновик</span>
                      )}
                    </td>
                    <td>{formatDate(item.published_at)}</td>
                    <td>
                      <Link
                        className="btn btn-sm"
                        href={`/admin/edit?type=news&id=${item.id}`}
                      >
                        Изменить
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="form-card">
        <h2 className="sect" style={{ fontSize: 16 }}>
          Что можно сделать в панели
        </h2>
        <ul className="panel" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          <li>добавить новость, указать раздел и дату публикации;</li>
          <li>вести список преподавателей и закреплённые дисциплины;</li>
          <li>обновлять архив документов и учебных планов;</li>
          <li>править текстовые страницы без изменения кода сайта.</li>
        </ul>
      </div>
    </>
  )
}
