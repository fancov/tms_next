'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTenant } from '@/contexts/TenantContext'

interface TenantData<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useTenantData<T>(
  fetchData: (tenantCode: string) => Promise<T>,
  initialData: T | null = null
): TenantData<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { currentTenant } = useTenant()

  const loadData = useCallback(async () => {
    if (!currentTenant) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchData(currentTenant.code)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [currentTenant, fetchData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return { data, isLoading, error }
} 