'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import { Search, Clock, Star, Building2 } from 'lucide-react'
import { MainNav } from '@/components/MainNav'

export default function RootPage() {
  const router = useRouter()
  const { currentTenant, tenants, setCurrentTenant } = useTenant()
  const [searchQuery, setSearchQuery] = useState('')
  const [recentTenants, setRecentTenants] = useState<typeof tenants>([])

  // 从 localStorage 加载最近访问的租户
  useEffect(() => {
    const recentTenantIds = JSON.parse(localStorage.getItem('recentTenants') || '[]')
    const recent = tenants.filter(t => recentTenantIds.includes(t.id))
    setRecentTenants(recent)
  }, [tenants])

  const handleSelectTenant = (tenant: typeof tenants[0]) => {
    // 更新最近访问的租户
    const recentTenantIds = JSON.parse(localStorage.getItem('recentTenants') || '[]')
    const updatedRecentIds = [
      tenant.id,
      ...recentTenantIds.filter((id: string) => id !== tenant.id)
    ].slice(0, 5) // 只保留最近5个
    localStorage.setItem('recentTenants', JSON.stringify(updatedRecentIds))

    setCurrentTenant(tenant)
    router.push(`/${tenant.code}/case`)
  }

  // 过滤租户列表
  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 按特性对租户进行分组
  const groupedTenants = filteredTenants.reduce((groups, tenant) => {
    const hasAutomation = tenant.features.includes('automation')
    const group = hasAutomation ? 'premium' : 'basic'
    return {
      ...groups,
      [group]: [...(groups[group] || []), tenant]
    }
  }, {} as Record<string, typeof tenants>)

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">租户管理</h1>
          <p className="text-xl text-gray-600">选择或搜索要访问的租户</p>
        </div>

        {/* 搜索框 */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索租户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 最近访问的租户 */}
          {recentTenants.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold">最近访问</h2>
              </div>
              <div className="space-y-3">
                {recentTenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => handleSelectTenant(tenant)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {tenant.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-3 text-left">
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.code}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 所有租户列表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">所有租户</h2>
            </div>
            {Object.entries(groupedTenants).map(([group, tenants]) => (
              <div key={group} className="mb-6 last:mb-0">
                <div className="flex items-center mb-3">
                  {group === 'premium' ? (
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  ) : null}
                  <h3 className="text-sm font-medium text-gray-500 uppercase">
                    {group === 'premium' ? '高级租户' : '基础租户'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {tenants.map(tenant => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSelectTenant(tenant)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        {tenant.logo ? (
                          <img
                            src={tenant.logo}
                            alt={tenant.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {tenant.name[0]}
                            </span>
                          </div>
                        )}
                        <div className="ml-3 text-left">
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.code}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.features.length} 个功能
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
