import Link from 'next/link'

export interface Crumb {
  label: string
  href?: string
}

/** Заголовок страницы с «хлебными крошками». */
export function PageHead({
  title,
  subtitle,
  crumbs,
}: {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
}) {
  return (
    <div className="page-head">
      {crumbs && crumbs.length > 0 ? (
        <div className="crumbs">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`}>
              {index > 0 ? <span>/</span> : null}
              {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
            </span>
          ))}
        </div>
      ) : null}
      <h1>{title}</h1>
      {subtitle ? <p className="sub">{subtitle}</p> : null}
    </div>
  )
}
