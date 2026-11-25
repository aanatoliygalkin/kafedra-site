'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { DEMO_MODE } from '@/lib/data'
import { useAuth } from '@/lib/auth'
import { ROLE_LABEL, isAdmin } from '@/lib/permissions'

const NAV = [
  { href: '/admin/', label: 'Обзор', adminOnly: false },
  { href: '/admin/news/', label: 'Новости', adminOnly: false },
  { href: '/admin/teachers/', label: 'Преподаватели', adminOnly: false },
  { href: '/admin/courses/', label: 'Дисциплины', adminOnly: false },
  { href: '/admin/documents/', label: 'Документы', adminOnly: false },
  { href: '/admin/pages/', label: 'Страницы', adminOnly: false },
  { href: '/admin/users/', label: 'Пользователи', adminOnly: true },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, ready, signOut } = useAuth()
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

  const admin = isAdmin(session.role)
  const items = NAV.filter((item) => !item.adminOnly || admin)

  return (
    <div className="wrap">
      <div className="admin-shell">
        <aside className="admin-nav" aria-label="Разделы панели управления">
          {items.map((item) => {
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
          <div className="admin-topbar">
            <div className="admin-user">
              <span className="admin-user-name">{session.full_name || session.email}</span>
              <span className={`role-badge ${admin ? 'admin' : 'staff'}`}>
                {ROLE_LABEL[session.role]}
              </span>
              {admin ? (
                <span className="admin-user-hint">полный доступ</span>
              ) : (
                <span className="admin-user-hint">
                  без управления составом кафедры и учётными записями
                </span>
              )}
            </div>
            <button className="btn btn-sm" type="button" onClick={() => void signOut()}>
              Выйти
            </button>
          </div>
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
