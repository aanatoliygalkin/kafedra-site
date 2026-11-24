'use client'

import { useEffect, useMemo, useState } from 'react'

import { PageHead } from '@/components/PageHead'
import { CardsSkeleton } from '@/components/Skeleton'
import { listTeachers } from '@/lib/data'
import { initials, plural } from '@/lib/format'
import type { Teacher } from '@/lib/types'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    listTeachers()
      .then((items) => {
        if (alive) setTeachers(items)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [])

  const visible = useMemo(() => {
    if (!teachers) return []
    const query = search.trim().toLowerCase()
    if (!query) return teachers
    return teachers.filter((teacher) =>
      `${teacher.full_name} ${teacher.position} ${teacher.degree} ${teacher.disciplines.join(' ')}`
        .toLowerCase()
        .includes(query)
    )
  }, [teachers, search])

  return (
    <div className="wrap" style={{ display: 'grid', gap: 20 }}>
      <PageHead
        title="Преподаватели"
        subtitle={
          teachers
            ? `${teachers.length} ${plural(teachers.length, [
                'преподаватель',
                'преподавателя',
                'преподавателей',
              ])} кафедры`
            : 'Состав кафедры'
        }
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Преподаватели' }]}
      />

      <div className="filters">
        <input
          className="input search"
          type="search"
          placeholder="Поиск по фамилии или дисциплине"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Поиск преподавателей"
        />
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {!teachers && !error ? <CardsSkeleton count={4} /> : null}

      {teachers ? (
        visible.length > 0 ? (
          <div className="person">
            {visible.map((teacher) => (
              <article className={`p${teacher.is_head ? ' head' : ''}`} key={teacher.id}>
                <div className="ava">
                  {teacher.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={teacher.photo_url} alt="" loading="lazy" />
                  ) : (
                    initials(teacher.full_name)
                  )}
                </div>
                <b>{teacher.full_name}</b>
                <i>{teacher.position}</i>
                {teacher.degree ? <i>{teacher.degree}</i> : null}
                <em>{teacher.disciplines.join(', ')}</em>
                <div className="contacts">
                  <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                  {teacher.phone ? <span>{teacher.phone}</span> : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">По вашему запросу преподаватели не найдены.</div>
        )
      ) : null}
    </div>
  )
}
