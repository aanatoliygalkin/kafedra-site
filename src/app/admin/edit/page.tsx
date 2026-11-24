import { Suspense } from 'react'

import { TextSkeleton } from '@/components/Skeleton'

import { EditView } from './EditView'

export const metadata = {
  title: 'Редактирование записи',
}

export default function AdminEditPage() {
  return (
    <Suspense
      fallback={
        <div className="form-card">
          <TextSkeleton />
        </div>
      }
    >
      <EditView />
    </Suspense>
  )
}
