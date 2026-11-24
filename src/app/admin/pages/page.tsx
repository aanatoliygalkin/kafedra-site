'use client'

import Link from 'next/link'

import { DataTable } from '@/components/admin/DataTable'
import { useEntities } from '@/components/admin/useEntities'
import { formatShortDate } from '@/lib/format'
import type { Page } from '@/lib/types'

export default function AdminPagesPage() {
  const { items, error, busy, remove } = useEntities<Page>('pages')

  return (
    <DataTable<Page>
      title="Страницы"
      createHref="/admin/edit?type=pages"
      editHref={(id) => `/admin/edit?type=pages&id=${id}`}
      rows={items}
      error={error}
      busy={busy}
      onDelete={remove}
      emptyText="Текстовые страницы не добавлены."
      searchFields={(row) => `${row.title} ${row.slug}`}
      columns={[
        { title: 'Название', render: (row) => <b>{row.title}</b> },
        {
          title: 'Адрес',
          render: (row) => (
            <Link className="link-more" href={`/info?slug=${row.slug}`}>
              /info?slug={row.slug}
            </Link>
          ),
        },
        {
          title: 'Обновлена',
          width: '110px',
          render: (row) => formatShortDate(row.updated_at),
        },
      ]}
    />
  )
}
