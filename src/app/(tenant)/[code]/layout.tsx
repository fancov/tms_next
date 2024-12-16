'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MainNav } from '@/components/MainNav'
import { useTenant } from '@/contexts/TenantContext'
import React from 'react'

export default function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { code: string }
}) {
  const router = useRouter()
  const { currentTenant, tenants, setCurrentTenant } = useTenant()
  const pathname = usePathname()
  const unwrappedParams = React.use(params) as { code: string }

  // 当路由中的租户参数改变时，更新当前租户
  useEffect(() => {
    const tenantFromUrl = tenants.find(t => t.code === unwrappedParams.code)
    if (tenantFromUrl) {
      if (!currentTenant || currentTenant.code !== tenantFromUrl.code) {
        setCurrentTenant(tenantFromUrl)
      }
    } else {
      // 如果租户不存在，重定向到租户选择页面
      router.push('/')
    }
  }, [unwrappedParams.code, tenants, currentTenant, setCurrentTenant, router])

  // 等待租户加载
  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main>
        {children}
      </main>
    </div>
  )
} 