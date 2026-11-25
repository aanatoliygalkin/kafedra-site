'use client'

import { DataTable } from '@/components/admin/DataTable'
import { useEntities } from '@/components/admin/useEntities'
import { useAuth } from '@/lib/auth'
import { adminOnlyText, canEdit } from '@/lib/permissions'
import type { Teacher } from '@/lib/types'

export default function AdminTeachersPage() {
  const { session } = useAuth()
  const { items, error, busy, remove } = useEntities<Teacher>('teachers')
  const allowed = canEdit('teachers', session?.role)

  return (
    <DataTable<Teacher>
      title="Преподаватели"
      createHref="/admin/edit?type=teachers"
      editHref={(id) => `/admin/edit?type=teachers&id=${id}`}
      rows={items}
      error={error}
      busy={busy}
      onDelete={remove}
      canCreate={allowed}
      canEdit={allowed}
      note={allowed ? undefined : adminOnlyText('Состав кафедры')}
      emptyText="Список преподавателей пуст."
      searchFields={(row) => `${row.full_name} ${row.position} ${row.email}`}
      columns={[
        {
          title: 'Преподаватель',
          render: (row) => (
            <>
              <b>{row.full_name}</b>
              {row.is_head ? <span className="tag g" style={{ marginLeft: 6 }}>зав. кафедрой</span> : null}
            </>
          ),
        },
        { title: 'Должность', render: (row) => row.position },
        {
          title: 'Дисциплины',
          render: (row) => row.disciplines.join(', '),
        },
        { title: 'Почта', width: '220px', render: (row) => row.email },
      ]}
    />
  )
}
