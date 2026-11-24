'use client'

import { useEffect, useState } from 'react'

import { DataTable } from '@/components/admin/DataTable'
import { useEntities } from '@/components/admin/useEntities'
import { listTeachers } from '@/lib/data'
import type { Course, Teacher } from '@/lib/types'

export default function AdminCoursesPage() {
  const { items, error, busy, remove } = useEntities<Course>('courses')
  const [teachers, setTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    listTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]))
  }, [])

  return (
    <DataTable<Course>
      title="Дисциплины"
      createHref="/admin/edit?type=courses"
      editHref={(id) => `/admin/edit?type=courses&id=${id}`}
      rows={items}
      error={error}
      busy={busy}
      onDelete={remove}
      emptyText="Дисциплины не добавлены."
      searchFields={(row) => `${row.title} ${row.code}`}
      columns={[
        { title: 'Код', width: '90px', render: (row) => row.code },
        {
          title: 'Дисциплина',
          render: (row) => (
            <>
              <b>{row.title}</b>
              <div style={{ color: '#8896a6', fontSize: 11.5 }}>{row.form}</div>
            </>
          ),
        },
        { title: 'Семестр', width: '90px', render: (row) => row.semester },
        { title: 'Часы', width: '80px', render: (row) => row.hours },
        {
          title: 'Преподаватель',
          render: (row) =>
            teachers.find((teacher) => teacher.id === row.teacher_id)?.full_name ?? '—',
        },
      ]}
    />
  )
}
