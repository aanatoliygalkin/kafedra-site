import { Suspense } from 'react'

import { TextSkeleton } from '@/components/Skeleton'

import { NewsItemView } from './NewsItemView'

export const metadata = {
  title: 'Новость',
}

export default function NewsItemPage() {
  return (
    <Suspense
      fallback={
        <div className="wrap">
          <div className="article">
            <TextSkeleton />
          </div>
        </div>
      }
    >
      <NewsItemView />
    </Suspense>
  )
}
