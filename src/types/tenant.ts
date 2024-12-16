export interface Tenant {
  id: string
  name: string
  code: string
  features: string[] // 特性标记，用于控制不同租户的功能
  logo?: string
}

export interface TenantContextType {
  currentTenant: Tenant | null
  setCurrentTenant: (tenant: Tenant) => void
  tenants: Tenant[]
} 