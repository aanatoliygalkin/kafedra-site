import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty" style={{ padding: '60px 20px' }}>
        <h1 style={{ fontSize: 22, color: 'var(--navy)', margin: '0 0 8px' }}>
          Страница не найдена
        </h1>
        <p style={{ margin: '0 0 16px' }}>
          Возможно, адрес изменился или в ссылке опечатка.
        </p>
        <Link className="btn btn-solid" href="/">
          На главную
        </Link>
      </div>
    </div>
  )
}
