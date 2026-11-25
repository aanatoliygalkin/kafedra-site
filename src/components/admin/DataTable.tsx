'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'

import { RowsSkeleton } from '@/components/Skeleton'

export interface Column<T> {
  title: string
  render: (row: T) => ReactNode
  width?: string
}

export interface DataTableProps<T extends { id: string }> {
  title: string
  createHref: string
  editHref: (id: string) => string
  columns: Column<T>[]
  rows: T[] | null
  error: string | null
  busy: boolean
  searchFields: (row: T) => string
  onDelete: (id: string) => void
  emptyText: string
  /** Может ли текущий пользователь добавлять записи. */
  canCreate?: boolean
  /** Может ли текущий пользователь изменять и удалять записи. */
  canEdit?: boolean
  /** Пояснение, если действия ограничены ролью. */
  note?: string
}

/** Таблица раздела панели управления с поиском и действиями. */
export function DataTable<T extends { id: string }>({
  title,
  createHref,
  editHref,
  columns,
  rows,
  error,
  busy,
  searchFields,
  onDelete,
  emptyText,
  canCreate = true,
  canEdit = true,
  note,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')

  const visible = useMemo(() => {
    if (!rows) return []
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => searchFields(row).toLowerCase().includes(query))
  }, [rows, search, searchFields])

  return (
    <>
      <div className="admin-head">
        <h1>{title}</h1>
        <div className="filters" style={{ margin: 0, flex: 1, justifyContent: 'flex-end' }}>
          <input
            className="input search"
            type="search"
            placeholder="Поиск"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Поиск в таблице"
          />
          {canCreate ? (
            <Link className="btn btn-solid" href={createHref}>
              + Добавить
            </Link>
          ) : null}
        </div>
      </div>

      {note ? <div className="admin-note">{note}</div> : null}

      {error ? <div className="alert error">{error}</div> : null}
      {!rows ? <RowsSkeleton count={5} /> : null}

      {rows && visible.length === 0 ? <div className="empty">{emptyText}</div> : null}

      {rows && visible.length > 0 ? (
        <div className="table-wrap" aria-busy={busy}>
          <table className="tbl">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.title} style={{ width: column.width }}>
                    {column.title}
                  </th>
                ))}
                {canEdit ? <th style={{ width: 150 }}>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.title}>{column.render(row)}</td>
                  ))}
                  {canEdit ? (
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Link className="btn btn-sm" href={editHref(row.id)}>
                          Изменить
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            if (window.confirm('Удалить запись? Действие нельзя отменить.')) {
                              onDelete(row.id)
                            }
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows && visible.length > 0 ? (
        <p className="sub">
          Всего записей: {visible.length}. Изменения сразу отображаются на страницах
          сайта.
        </p>
      ) : null}
    </>
  )
}
