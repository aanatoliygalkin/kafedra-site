/**
 * Настройка сборки.
 *
 * Сайт собирается в статические файлы (output: 'export'), поэтому его можно
 * разместить на любом хостинге статики, включая GitHub Pages. Адрес проекта
 * на GitHub Pages содержит имя репозитория, которое передаётся через
 * переменную NEXT_PUBLIC_BASE_PATH в рабочем процессе GitHub Actions.
 */

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
