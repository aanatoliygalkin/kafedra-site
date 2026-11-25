'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DEMO_MODE } from '@/lib/data'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const { signIn, session, ready } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
      router.replace('/admin/')
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wrap">
      <div className="login-layout">
        <div>
          <h1 style={{ fontSize: 26, color: 'var(--navy)', margin: '0 0 12px' }}>
            Служебный раздел
          </h1>
          <p className="sub" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Панель управления предназначена для сотрудников кафедры. После входа
            доступны новости, преподаватели, дисциплины, документы и текстовые
            страницы сайта.
          </p>
          <div className="panel" style={{ marginTop: 18 }}>
            <h3>Права доступа</h3>
            <ul>
              <li>сотрудник — новости, дисциплины, документы и страницы сайта;</li>
              <li>администратор — то же плюс состав кафедры и учётные записи;</li>
              <li>гости видят только опубликованные материалы.</li>
            </ul>
          </div>
          {DEMO_MODE ? (
            <div className="demo-note" style={{ marginTop: 14 }}>
              Демонстрационный вход: <b>admin@iseu.local</b> / <b>admin123</b>
              <br />
              Второй пользователь: staff@iseu.local / staff123
            </div>
          ) : null}
        </div>

        <div className="login-card">
          {ready && session ? (
            <>
              <h1>Вы уже вошли</h1>
              <p>
                {session.full_name} ({session.email}), роль: {session.role}.
              </p>
              <div className="form-actions">
                <Link className="btn btn-solid" href="/admin/">
                  Перейти в панель
                </Link>
                <Link className="btn" href="/">
                  На главную
                </Link>
              </div>
            </>
          ) : (
            <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
              <h1>Вход для сотрудников</h1>
              <p>Введите служебную почту и пароль, выданные администратором.</p>

              {error ? <div className="alert error">{error}</div> : null}

              <div className="field">
                <label htmlFor="email">Электронная почта</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Пароль</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button className="btn btn-solid" type="submit" disabled={busy}>
                  {busy ? 'Проверка…' : 'Войти'}
                </button>
                <Link className="btn" href="/">
                  На главную
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
