/** Заглушки на время загрузки данных. */

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="cards" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton skeleton-card" key={index} />
      ))}
    </div>
  )
}

export function RowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="table-wrap" aria-hidden="true">
      <div style={{ padding: 16, display: 'grid', gap: 10 }}>
        {Array.from({ length: count }).map((_, index) => (
          <div className="skeleton" key={index} style={{ height: 38 }} />
        ))}
      </div>
    </div>
  )
}

export function TextSkeleton() {
  return (
    <div style={{ display: 'grid', gap: 10 }} aria-hidden="true">
      <div className="skeleton" style={{ height: 18, width: '60%' }} />
      <div className="skeleton" style={{ height: 14 }} />
      <div className="skeleton" style={{ height: 14 }} />
      <div className="skeleton" style={{ height: 14, width: '80%' }} />
    </div>
  )
}
