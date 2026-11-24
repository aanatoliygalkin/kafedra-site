'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { NewsCard } from '@/components/NewsCard'
import { CardsSkeleton } from '@/components/Skeleton'
import { DEMO_MODE, listDocuments, listNews } from '@/lib/data'
import { formatBytes } from '@/lib/format'
import type { DocumentItem, News } from '@/lib/types'

export default function HomePage() {
  const [news, setNews] = useState<News[] | null>(null)
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([listNews({ limit: 3 }), listDocuments({ limit: 4 })])
      .then(([newsResult, documentsResult]) => {
        if (!alive) return
        setNews(newsResult.items)
        setDocuments(documentsResult)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="wrap" style={{ display: 'grid', gap: 26 }}>
      <section className="hero">
        <div>
          <h1>
            Кафедра информационных систем
            <br />в экономике и управлении
          </h1>
          <p>
            Готовим специалистов по проектированию, разработке и сопровождению
            информационных систем для экономики и управления: от постановки задачи
            до запуска и поддержки готового решения.
          </p>
          <div className="actions">
            <Link className="pill" href="/info?slug=admission">
              Поступающим
            </Link>
            <Link className="btn btn-ghost" href="/documents/">
              Учебные планы и документы
            </Link>
          </div>
        </div>
        <div className="facts">
          <div className="fact">
            <b>1998</b>
            <span>год основания кафедры</span>
          </div>
          <div className="fact">
            <b>8</b>
            <span>преподавателей, из них 4 кандидата наук</span>
          </div>
          <div className="fact">
            <b>4</b>
            <span>направления подготовки бакалавриата</span>
          </div>
        </div>
      </section>

      {DEMO_MODE ? (
        <div className="demo-note">
          Демонстрационная версия сайта: данные хранятся в браузере и не требуют
          сервера. Вход в панель управления — admin@iseu.local / admin123.
        </div>
      ) : null}

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="sect">Новости кафедры</h2>
            <p className="sub">Последние публикации</p>
          </div>
          <Link className="link-more" href="/news/">
            Все новости →
          </Link>
        </div>

        {error ? <div className="alert error">{error}</div> : null}
        {!news && !error ? <CardsSkeleton /> : null}
        {news ? (
          news.length > 0 ? (
            <div className="cards">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="empty">Пока нет опубликованных новостей.</div>
          )
        ) : null}
      </section>

      <div className="two">
        <section className="panel">
          <h3>О кафедре</h3>
          <p>
            Кафедра ведёт подготовку по направлениям, связанным с разработкой
            информационных систем и цифровой экономикой. Учебный процесс опирается
            на лабораторную базу института и проектные формы работы.
          </p>
          <ul>
            <li>Проектирование информационных систем и баз данных</li>
            <li>Веб-технологии и разработка клиентских приложений</li>
            <li>Экономика информационных систем и оценка эффективности ИТ</li>
            <li>Практика в ИТ-подразделениях организаций и на профильных предприятиях</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            <Link className="link-more" href="/info?slug=about">
              Подробнее о кафедре →
            </Link>
          </p>
        </section>

        <section>
          <h2 className="sect" style={{ fontSize: 16 }}>
            Быстрый доступ
          </h2>
          <p className="sub">&nbsp;</p>
          <div className="quick">
            {documents
              ? documents.map((document) => (
                  <Link key={document.id} href="/documents/">
                    {document.title}
                    <span>{formatBytes(document.file_size)}</span>
                  </Link>
                ))
              : null}
            {!documents ? <div className="skeleton" style={{ height: 44 }} /> : null}
            <Link href="/teachers/">
              Состав кафедры <span>8 чел.</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
