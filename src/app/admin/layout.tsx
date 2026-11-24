'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { DEMO_MODE } from '@/lib/data'
import { useAuth } from '@/lib/auth'

const NAV = [
  { href: '/admin/', label: 'Обзор' },
  { href: '/admin/news/', label: 'Новости' },
  { href: '/admin/teachers/', label: 'Преподаватели' },
  { href: '/admin/courses/', label: 'Дисциплины' },
  { href: '/admin/documents/', label: 'Документы' },
  { href: '/admin/pages/', label: 'Страницы' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth()
  const pathname = usePathname() || '/admin'
  const router = useRouter()

  useEffect(() => {
    if (ready && !session) {
      router.replace('/login/')
    }
  }, [ready, session, router])

  if (!ready) {
    return (
      <div className="wrap">
        <div className="skeleton" style={{ height: 300 }} />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="wrap">
        <div className="empty">
          Для доступа к панели управления нужен вход.{' '}
          <Link href="/login/">Перейти на страницу входа</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="wrap">
      <div className="admin-shell">
        <aside className="admin-nav" aria-label="Разделы панели управления">
          {NAV.map((item) => {
            const active =
              item.href === '/admin/'
                ? pathname === '/admin' || pathname === '/admin/'
                : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={active ? 'on' : undefined}>
                {item.label}
              </Link>
            )
          })}
          <hr style={{ border: 'none', borderTop: '1px solid #edf1f6', margin: '6px 0' }} />
          <Link href="/">
            На сайт <span>→</span>
          </Link>
        </aside>

        <div className="admin-main">
          {DEMO_MODE ? (
            <div className="demo-note">
              Демонстрационный режим: записи сохраняются в этом браузере. После
              подключения Supabase панель работает с таблицами базы.
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}
