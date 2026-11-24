'use client'

/** Постраничная навигация списка новостей. */
export function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number
  total: number
  perPage: number
  onChange: (page: number) => void
}) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null

  const items: number[] = []
  for (let index = 1; index <= pages; index += 1) {
    if (index === 1 || index === pages || Math.abs(index - page) <= 1) {
      items.push(index)
    } else if (items[items.length - 1] !== 0) {
      items.push(0)
    }
  }

  return (
    <nav className="pagination" aria-label="Страницы новостей">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ←
      </button>
      {items.map((item, index) =>
        item === 0 ? (
          <span key={`gap-${index}`} style={{ color: '#8896a6' }}>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === page ? 'on' : undefined}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        )
      )}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        →
      </button>
    </nav>
  )
}
