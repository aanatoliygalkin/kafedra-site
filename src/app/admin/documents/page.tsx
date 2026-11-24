'use client'

import { DataTable } from '@/components/admin/DataTable'
import { useEntities } from '@/components/admin/useEntities'
import { formatBytes, formatShortDate } from '@/lib/format'
import type { DocumentItem } from '@/lib/types'

export default function AdminDocumentsPage() {
  const { items, error, busy, remove } = useEntities<DocumentItem>('documents')

  return (
    <DataTable<DocumentItem>
      title="Документы"
      createHref="/admin/edit?type=documents"
      editHref={(id) => `/admin/edit?type=documents&id=${id}`}
      rows={items}
      error={error}
      busy={busy}
      onDelete={remove}
      emptyText="Документы не добавлены."
      searchFields={(row) => `${row.title} ${row.category}`}
      columns={[
        { title: 'Название', render: (row) => row.title },
        {
          title: 'Категория',
          width: '190px',
          render: (row) => <span className="tag">{row.category}</span>,
        },
        { title: 'Размер', width: '90px', render: (row) => formatBytes(row.file_size) },
        {
          title: 'Обновлён',
          width: '110px',
          render: (row) => formatShortDate(row.updated_at),
        },
      ]}
    />
  )
}
