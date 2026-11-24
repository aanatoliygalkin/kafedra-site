'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useAuth } from '@/lib/auth'

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/news', label: 'Новости' },
  { href: '/teachers', label: 'Преподаватели' },
  { href: '/courses', label: 'Дисциплины' },
  { href: '/documents', label: 'Документы' },
  { href: '/info?slug=contacts', label: 'Контакты' },
]

export function SiteHeader() {
  const pathname = usePathname() || '/'
  const { session, ready, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (href: string): boolean => {
    const base = href.split('?')[0]
    if (base === '/') return pathname === '/'
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div>
            АНО ВО «Российский новый университет» · Институт информационных систем
          </div>
          <div>
            +7 (495) 925-03-47 · iseu@rosnou.ru
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap">
          <Link className="logo" href="/">
            <span className="emblem">
              ИС
              <br />
              ЭУ
            </span>
            <span>
              <b>
                Кафедра информационных систем
                <br />
                в экономике и управлении
              </b>
              <span>АНО ВО «РосНОУ» · Москва</span>
            </span>
          </Link>

          <nav className={`nav${open ? ' open' : ''}`} aria-label="Основное меню">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'on' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {ready && session ? (
              <>
                <Link className="btn btn-sm" href="/admin/">
                  Панель
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link className="btn" href="/login/">
                Вход
              </Link>
            )}
            <button
              type="button"
              className="burger"
              aria-label="Открыть меню"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
