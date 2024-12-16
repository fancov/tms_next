'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, Building2 } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'

export function MainNav() {
  const pathname = usePathname()
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false)

  const { currentTenant, setCurrentTenant, tenants } = useTenant()
  const router = useRouter()

  // 根据当前租户的特性生成导航项
  const getNavItems = () => {
    if (!currentTenant) return []

    const baseItems = [
      { name: '测试用例', href: `/${currentTenant.code}/case`, feature: 'case' },
      { name: '测试计划', href: `/${currentTenant.code}/plan`, feature: 'plan' },
      { name: '测试报告', href: `/${currentTenant.code}/report`, feature: 'report' },
    ]

    if (currentTenant.features.includes('automation')) {
      baseItems.push({ 
        name: '自动化任务', 
        href: `/${currentTenant.code}/automation`, 
        feature: 'automation' 
      })
    }

    return baseItems.filter(item => currentTenant.features.includes(item.feature))
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm h-14 flex items-center px-4">
        <h1 className="text-xl font-semibold mr-8">TMS</h1>
        <div className="flex-1 flex items-center">
          <div className="flex space-x-4">
            {getNavItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 租户切换下拉菜单 */}
        <div className="relative">
          <button
            onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Building2 className="w-4 h-4" />
            <span>{currentTenant?.name || '选择租户'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isTenantMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => {
                    setCurrentTenant(tenant)
                    setIsTenantMenuOpen(false)
                    router.push(`/${tenant.code}/case`)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    currentTenant?.id === tenant.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tenant.name}
                </button>
              ))}
              <div className="border-t my-1"></div>
              <Link
                href="/"
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                onClick={() => setIsTenantMenuOpen(false)}
              >
                管理租户
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
} 