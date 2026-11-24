'use client'

import { useEffect, useMemo, useState } from 'react'

import { NewsCard } from '@/components/NewsCard'
import { PageHead } from '@/components/PageHead'
import { Pagination } from '@/components/Pagination'
import { CardsSkeleton } from '@/components/Skeleton'
import { listNews } from '@/lib/data'
import { plural } from '@/lib/format'
import type { News, NewsCategory } from '@/lib/types'

const CATEGORIES: Array<NewsCategory | 'Все'> = [
  'Все',
  'Учёба',
  'Студенты',
  'Расписание',
  'Наука',
  'Приём',
]

const PER_PAGE = 6

export default function NewsPage() {
  const [items, setItems] = useState<News[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<NewsCategory | 'Все'>('Все')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // задержка перед поиском, чтобы не отправлять запрос на каждое нажатие
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true
    setLoading(true)
    listNews({
      category: category === 'Все' ? undefined : category,
      search: query || undefined,
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      publishedOnly: true,
    })
      .then((result) => {
        if (!alive) return
        setItems(result.items)
        setTotal(result.total)
        setError(null)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [category, query, page])

  const subtitle = useMemo(
    () => `${total} ${plural(total, ['публикация', 'публикации', 'публикаций'])}`,
    [total]
  )

  return (
    <div className="wrap" style={{ display: 'grid', gap: 20 }}>
      <PageHead
        title="Новости кафедры"
        subtitle={subtitle}
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Новости' }]}
      />

      <div className="filters">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${category === item ? ' on' : ''}`}
            onClick={() => {
              setCategory(item)
              setPage(1)
            }}
          >
            {item}
          </button>
        ))}
        <div className="grow" />
        <input
          className="input search"
          type="search"
          placeholder="Поиск по новостям"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          aria-label="Поиск по новостям"
        />
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {!items && !error ? <CardsSkeleton count={PER_PAGE} /> : null}

      {items && items.length > 0 ? (
        <>
          <div className="cards" aria-busy={loading}>
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
          <Pagination page={page} total={total} perPage={PER_PAGE} onChange={setPage} />
        </>
      ) : null}

      {items && items.length === 0 ? (
        <div className="empty">
          По вашему запросу ничего не найдено. Попробуйте изменить категорию или
          очистить поиск.
        </div>
      ) : null}
    </div>
  )
}
