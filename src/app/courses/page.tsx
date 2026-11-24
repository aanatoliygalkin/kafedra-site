'use client'

import { useEffect, useMemo, useState } from 'react'

import { PageHead } from '@/components/PageHead'
import { RowsSkeleton } from '@/components/Skeleton'
import { listCourses } from '@/lib/data'
import { plural } from '@/lib/format'
import type { Course } from '@/lib/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [semester, setSemester] = useState<number | 'Все'>('Все')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    listCourses()
      .then((items) => {
        if (alive) setCourses(items)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
    return () => {
      alive = false
    }
  }, [])

  const semesters = useMemo(
    () =>
      Array.from(new Set((courses ?? []).map((course) => course.semester))).sort(
        (a, b) => a - b
      ),
    [courses]
  )

  const visible = useMemo(() => {
    if (!courses) return []
    const query = search.trim().toLowerCase()
    return courses.filter((course) => {
      if (semester !== 'Все' && course.semester !== semester) return false
      if (!query) return true
      return `${course.title} ${course.code} ${course.teacher_name ?? ''}`
        .toLowerCase()
        .includes(query)
    })
  }, [courses, semester, search])

  const totalHours = visible.reduce((sum, course) => sum + course.hours, 0)

  return (
    <div className="wrap" style={{ display: 'grid', gap: 20 }}>
      <PageHead
        title="Дисциплины"
        subtitle={
          courses
            ? `${courses.length} ${plural(courses.length, [
                'дисциплина',
                'дисциплины',
                'дисциплин',
              ])} учебного плана`
            : 'Учебный план кафедры'
        }
        crumbs={[{ label: 'Главная', href: '/' }, { label: 'Дисциплины' }]}
      />

      <div className="filters">
        <button
          type="button"
          className={`chip${semester === 'Все' ? ' on' : ''}`}
          onClick={() => setSemester('Все')}
        >
          Все семестры
        </button>
        {semesters.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${semester === item ? ' on' : ''}`}
            onClick={() => setSemester(item)}
          >
            {item} семестр
          </button>
        ))}
        <div className="grow" />
        <input
          className="input search"
          type="search"
          placeholder="Поиск по названию"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Поиск дисциплин"
        />
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {!courses && !error ? <RowsSkeleton /> : null}

      {courses ? (
        visible.length > 0 ? (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Код</th>
                    <th>Дисциплина</th>
                    <th>Семестр</th>
                    <th>Часы</th>
                    <th>Зачётные единицы</th>
                    <th>Преподаватель</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((course) => (
                    <tr key={course.id}>
                      <td>{course.code}</td>
                      <td>
                        <b>{course.title}</b>
                        {course.description ? (
                          <div style={{ color: '#6b7a8c', fontSize: 12, marginTop: 3 }}>
                            {course.description}
                          </div>
                        ) : null}
                      </td>
                      <td>{course.semester}</td>
                      <td>{course.hours}</td>
                      <td>{course.credits}</td>
                      <td>{course.teacher_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="sub">
              Показано дисциплин: {visible.length}, общая трудоёмкость:{' '}
              {totalHours} {plural(totalHours, ['час', 'часа', 'часов'])}.
            </p>
          </>
        ) : (
          <div className="empty">По выбранным условиям дисциплины не найдены.</div>
        )
      ) : null}
    </div>
  )
}
