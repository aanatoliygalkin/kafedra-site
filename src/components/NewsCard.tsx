import Link from 'next/link'

import { formatDate, shorten } from '@/lib/format'
import type { News } from '@/lib/types'

const CATEGORY_CLASS: Record<string, string> = {
  Учёба: 'cat-study',
  Студенты: 'cat-students',
  Расписание: 'cat-schedule',
  Наука: 'cat-science',
  Приём: 'cat-admission',
}

/** Карточка новости. Компонент получает данные через свойства. */
export function NewsCard({ item, compact = false }: { item: News; compact?: boolean }) {
  const className = `card ${CATEGORY_CLASS[item.category] ?? 'cat-study'}`
  const text = item.excerpt || item.body

  return (
    <Link className={className} href={`/news/item?id=${item.slug}`}>
      <div className="thumb">
        {item.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_url} alt="" loading="lazy" />
        ) : null}
        <span className="tag-badge">{item.category}</span>
      </div>
      <div className="body">
        <div className="date">{formatDate(item.published_at)}</div>
        <h3>{item.title}</h3>
        <p>{shorten(text, compact ? 90 : 140)}</p>
        <span className="more">Читать →</span>
      </div>
    </Link>
  )
}
