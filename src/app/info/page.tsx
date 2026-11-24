import { Suspense } from 'react'

import { TextSkeleton } from '@/components/Skeleton'

import { InfoView } from './InfoView'

export const metadata = {
  title: 'Информация',
}

export default function InfoPage() {
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
      <InfoView />
    </Suspense>
  )
}
