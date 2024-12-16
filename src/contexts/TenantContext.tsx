'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Tenant, TenantContextType } from '@/types/tenant'

// 示例租户数据
const defaultTenants: Tenant[] = [
  {
    id: 'tenant1',
    name: 'DIO',
    code: 'dio',
    features: ['case', 'plan', 'report']
  },
  {
    id: 'tenant2',
    name: 'CCS',
    code: 'ccs',
    features: ['case', 'plan', 'report', 'automation']
  },
  {
    id: 'tenant3',
    name: 'PIT',
    code: 'pit',
    features: ['case', 'plan', 'report']
  }
]

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [tenants] = useState<Tenant[]>(defaultTenants)

  // 从 localStorage 恢复上次选择的租户
  useEffect(() => {
    const savedTenantId = localStorage.getItem('currentTenantId')
    if (savedTenantId) {
      const savedTenant = tenants.find(t => t.id === savedTenantId)
      if (savedTenant) {
        setCurrentTenant(savedTenant)
      }
    }
  }, [tenants])

  // 切换租户时保存选择
  const handleSetTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant)
    localStorage.setItem('currentTenantId', tenant.id)
  }

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant: handleSetTenant, tenants }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
} 