'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PageHead } from '@/components/PageHead'
import { TextSkeleton } from '@/components/Skeleton'
import { getPageBySlug } from '@/lib/data'
import { paragraphs } from '@/lib/format'
import type { Page } from '@/lib/types'

const FALLBACK_LINKS = [
  { slug: 'about', label: 'О кафедре' },
  { slug: 'admission', label: 'Поступающим' },
  { slug: 'contacts', label: 'Контакты' },
  { slug: 'sitemap', label: 'Карта сайта' },
]

export function InfoView() {
  const params = useSearchParams()
  const slug = params.get('slug') ?? 'about'
  const [page, setPage] = useState<Page | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let alive = true
    setNotFound(false)
    getPageBySlug(slug)
      .then((result) => {
        if (!alive) return
        if (!result) {
          setNotFound(true)
          return
        }
        setPage(result)
        document.title = `${result.title} — Кафедра ИСЭиУ`
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [slug])

  if (error) {
    return (
      <div className="wrap">
        <div className="alert error">{error}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="wrap">
        <div className="empty">
          Страница не найдена. <Link href="/">На главную</Link>.
        </div>
      </div>
    )
  }

  if (!page) {
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
        title={page.title}
        crumbs={[{ label: 'Главная', href: '/' }, { label: page.title }]}
      />
      <article className="article">
        <div className="text">
          {paragraphs(page.body).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <p style={{ marginTop: 22 }}>
          <Link className="link-more" href="/documents/">
            Документы кафедры →
          </Link>
        </p>
      </article>
      <div className="filters">
        {FALLBACK_LINKS.filter((item) => item.slug !== page.slug).map((item) => (
          <Link key={item.slug} className="chip" href={`/info?slug=${item.slug}`}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
