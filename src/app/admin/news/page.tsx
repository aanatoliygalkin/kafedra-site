'use client'

import { DataTable } from '@/components/admin/DataTable'
import { useEntities } from '@/components/admin/useEntities'
import { formatDate, formatShortDate } from '@/lib/format'
import type { News } from '@/lib/types'

export default function AdminNewsPage() {
  const { items, error, busy, remove } = useEntities<News>('news')

  return (
    <DataTable<News>
      title="Новости"
      createHref="/admin/edit?type=news"
      editHref={(id) => `/admin/edit?type=news&id=${id}`}
      rows={items}
      error={error}
      busy={busy}
      onDelete={remove}
      emptyText="Новостей пока нет. Добавьте первую запись."
      searchFields={(row) => `${row.title} ${row.slug} ${row.category}`}
      columns={[
        {
          title: 'Заголовок',
          render: (row) => (
            <>
              <b>{row.title}</b>
              <div style={{ color: '#8896a6', fontSize: 11.5 }}>{row.slug}</div>
            </>
          ),
        },
        {
          title: 'Категория',
          width: '130px',
          render: (row) => <span className="tag">{row.category}</span>,
        },
        {
          title: 'Статус',
          width: '130px',
          render: (row) =>
            row.published ? (
              <span className="tag g">Опубликована</span>
            ) : (
              <span className="tag y">Черновик</span>
            ),
        },
        {
          title: 'Дата',
          width: '120px',
          render: (row) => formatShortDate(row.published_at),
        },
      ]}
    />
  )
}
