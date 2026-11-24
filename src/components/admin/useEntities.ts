'use client'

import { useCallback, useEffect, useState } from 'react'

import { deleteEntity, listEntity } from '@/lib/data'
import type { EntityName } from '@/lib/types'

/** Загрузка записей раздела для панели управления. */
export function useEntities<T extends { id: string }>(type: EntityName) {
  const [items, setItems] = useState<T[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(() => {
    let alive = true
    setBusy(true)
    listEntity<T>(type, { limit: 200 })
      .then((result) => {
        if (!alive) return
        setItems(result.items)
        setError(null)
      })
      .catch((reason: Error) => {
        if (alive) setError(reason.message)
      })
      .finally(() => {
        if (alive) setBusy(false)
      })
    return () => {
      alive = false
    }
  }, [type])

  useEffect(() => reload(), [reload])

  const remove = useCallback(
    async (id: string) => {
      setBusy(true)
      try {
        await deleteEntity(type, id)
        setError(null)
      } catch (reason) {
        setError((reason as Error).message)
      } finally {
        reload()
      }
    },
    [type, reload]
  )

  return { items, error, busy, reload, remove, setError }
}
