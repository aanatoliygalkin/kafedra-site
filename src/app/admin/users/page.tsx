'use client'

import { useCallback, useEffect, useState } from 'react'

import { DEMO_MODE, createProfile, deleteProfile, listProfiles, updateProfileRole } from '@/lib/data'
import { useAuth } from '@/lib/auth'
import { ROLE_LABEL, isAdmin } from '@/lib/permissions'
import { RowsSkeleton } from '@/components/Skeleton'
import type { Profile, Role } from '@/lib/types'

const ROLES: Role[] = ['admin', 'staff']

export default function AdminUsersPage() {
  const { session } = useAuth()
  const admin = isAdmin(session?.role)
  const [rows, setRows] = useState<Profile[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'staff' as Role,
  })

  const load = useCallback(() => {
    setBusy(true)
    listProfiles()
      .then((items) => {
        setRows(items)
        setError(null)
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setBusy(false))
  }, [])

  useEffect(() => {
    if (admin) load()
  }, [admin, load])

  if (!admin) {
    return (
      <div className="empty">
        Раздел «Пользователи» доступен только администратору. Если вам нужна
        новая учётная запись или другая роль — обратитесь к администратору сайта.
      </div>
    )
  }

  const changeRole = async (id: string, role: Role) => {
    setBusy(true)
    try {
      await updateProfileRole(id, role)
      setError(null)
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      load()
    }
  }

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await createProfile(form)
      setForm({ email: '', full_name: '', password: '', role: 'staff' })
      setError(null)
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      load()
    }
  }

  const remove = async (id: string, name: string) => {
    if (id === session?.id) {
      setError('Нельзя удалить учётную запись, под которой выполнен вход')
      return
    }
    if (!window.confirm(`Удалить учётную запись «${name}»? Новости и дисциплины сохранятся.`)) {
      return
    }
    setBusy(true)
    try {
      await deleteProfile(id)
      setError(null)
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      load()
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Пользователи</h1>
      </div>

      <div className="admin-note">
        Сотрудник ведёт новости, дисциплины, документы и страницы сайта. Состав
        кафедры и учётные записи изменяет администратор. Роли проверяются и в
        интерфейсе, и правилами доступа базы.
      </div>

      {error ? <div className="alert error">{error}</div> : null}
      {!rows ? <RowsSkeleton count={3} /> : null}

      {rows ? (
        <div className="table-wrap" aria-busy={busy}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th style={{ width: 260 }}>Почта</th>
                <th style={{ width: 200 }}>Роль</th>
                {DEMO_MODE ? <th style={{ width: 110 }}>Действия</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.full_name || '—'}</b>
                    {row.id === session?.id ? (
                      <div style={{ color: '#8896a6', fontSize: 11.5 }}>это вы</div>
                    ) : null}
                  </td>
                  <td>{row.email}</td>
                  <td>
                    <select
                      className="select"
                      value={row.role}
                      onChange={(event) => void changeRole(row.id, event.target.value as Role)}
                      aria-label={`Роль пользователя ${row.email}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  {DEMO_MODE ? (
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        type="button"
                        onClick={() => void remove(row.id, row.full_name || row.email)}
                      >
                        Удалить
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {DEMO_MODE ? (
        <form className="form-card" onSubmit={add} style={{ marginTop: 16 }}>
          <h2 className="sect" style={{ fontSize: 16 }}>
            Новая учётная запись
          </h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="u-name">Фамилия, имя, отчество</label>
              <input
                id="u-name"
                className="input"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="u-email">Электронная почта</label>
              <input
                id="u-email"
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="u-pass">Пароль</label>
              <input
                id="u-pass"
                className="input"
                type="text"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="u-role">Роль</label>
              <select
                id="u-role"
                className="select"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-solid" type="submit" disabled={busy}>
              {busy ? 'Сохранение…' : 'Добавить учётную запись'}
            </button>
          </div>
          <p className="hint">
            В демонстрационном режиме учётные записи хранятся в этом браузере. В
            рабочей базе сотрудников создают в панели Supabase — при создании
            срабатывает триггер и профиль получает роль сотрудника.
          </p>
        </form>
      ) : (
        <p className="hint">
          В рабочей базе учётные записи создаются в панели Supabase: при создании
          пользователя триггер добавляет профиль с ролью сотрудника, а роль
          администратора назначается здесь.
        </p>
      )}
    </>
  )
}
