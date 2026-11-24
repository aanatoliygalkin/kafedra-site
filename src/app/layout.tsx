import type { Metadata, Viewport } from 'next'

import { AuthProvider } from '@/lib/auth'

import './globals.css'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: {
    default: 'Кафедра информационных систем в экономике и управлении',
    template: '%s — Кафедра ИСЭиУ',
  },
  description:
    'Официальный сайт кафедры информационных систем в экономике и управлении АНО ВО «Российский новый университет»: новости, преподаватели, дисциплины и документы.',
  keywords: [
    'кафедра',
    'информационные системы',
    'РосНОУ',
    'новости кафедры',
    'учебные документы',
  ],
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%231e3a5f"/><text x="32" y="42" font-family="Arial" font-size="26" fill="%23fff" text-anchor="middle">ИС</text></svg>',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e3a5f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
