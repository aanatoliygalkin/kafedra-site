'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PageHead } from '@/components/PageHead'
import { TextSkeleton } from '@/components/Skeleton'
import { getNewsBySlug } from '@/lib/data'
import { formatDate, paragraphs } from '@/lib/format'
import type { News } from '@/lib/types'

export function NewsItemView() {
  const params = useSearchParams()
  const slug = params.get('id') ?? ''
  const [item, setItem] = useState<News | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      return
    }
    let alive = true
    setNotFound(false)
    getNewsBySlug(slug)
      .then((result) => {
        if (!alive) return
        if (!result) {
          setNotFound(true)
          return
        }
        setItem(result)
        document.title = `${result.title} — Кафедра ИСЭиУ`
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [slug])

  if (notFound) {
    return (
      <div className="wrap">
        <div className="empty">
          Новость не найдена. <Link href="/news/">Вернуться к списку новостей</Link>.
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="wrap">
        <div className="alert error">{error}</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="wrap">
        <div className="article">
          <TextSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="wrap" style={{ display: 'grid', gap: 18 }}>
      <PageHead
        title="Новость"
        crumbs={[
          { label: 'Главная', href: '/' },
          { label: 'Новости', href: '/news/' },
          { label: item.title },
        ]}
      />
      <article className="article">
        <div className="meta">
          <span className="tag">{item.category}</span>
          <span>{formatDate(item.published_at)}</span>
        </div>
        <h1>{item.title}</h1>
        {item.cover_url ? (
          <div className="cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover_url} alt="" />
          </div>
        ) : null}
        <div className="text">
          {paragraphs(item.body).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <p style={{ marginTop: 22 }}>
          <Link className="link-more" href="/news/">
            ← Все новости
          </Link>
        </p>
      </article>
    </div>
  )
}
