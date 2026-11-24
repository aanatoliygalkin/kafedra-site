/**
 * Префикс статических файлов и ссылок.
 *
 * На GitHub Pages проект открывается по адресу /имя-репозитория/, поэтому
 * адреса файлов из каталога public нужно дополнять этим префиксом.
 * Компонент Link добавляет basePath сам, обычные <a> и <img> — нет.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')

export function withBase(path: string): string {
  if (!path) return basePath || '/'
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }
  if (path.startsWith('#')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalized}`
}

export const BASE_PATH = basePath
