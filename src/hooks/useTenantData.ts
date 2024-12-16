'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTenant } from '@/contexts/TenantContext'

type FetchFunction<T> = (tenantCode: string) => Promise<T>

export function useTenantData<T>(
  fetchData: FetchFunction<T>,
  dependencies: any[] = []
) {
  const { currentTenant } = useTenant()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize the fetchData function to prevent infinite loops
  const memoizedFetchData = useCallback(fetchData, dependencies)

  useEffect(() => {
    let isMounted = true

    const fetchDataForTenant = async () => {
      if (!currentTenant) return

      setIsLoading(true)
      try {
        const result = await memoizedFetchData(currentTenant.code)
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
          setData(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDataForTenant()

    return () => {
      isMounted = false
    }
  }, [currentTenant?.code, memoizedFetchData])

  return { data, isLoading, error }
} 