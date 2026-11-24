import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <b>Кафедра информационных систем в экономике и управлении</b>
          АНО ВО «Российский новый университет». 105005, Москва, ул. Радио, д. 22.
          <br />
          Материалы сайта доступны по лицензии CC BY-NC-SA.
        </div>
        <div className="col">
          <b>Разделы</b>
          <Link href="/news/">Новости</Link>
          <Link href="/teachers/">Преподаватели</Link>
          <Link href="/courses/">Дисциплины</Link>
          <Link href="/documents/">Документы</Link>
        </div>
        <div className="col">
          <b>Служебное</b>
          <Link href="/login/">Вход для сотрудников</Link>
          <Link href="/info?slug=sitemap">Карта сайта</Link>
          <Link href="/info?slug=about">О кафедре</Link>
          <Link href="/info?slug=contacts">Контакты</Link>
        </div>
      </div>
    </footer>
  )
}
