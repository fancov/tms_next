'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { TestCase } from '@/types/case'
import { testCases } from '@/data/case/testData'

export default function EditCasePage({
  params
}: {
  params: Promise<{ code: string; id: string }>
}) {
  const unwrappedParams = React.use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<TestCase>>({
    name: '',
    module: '',
    priority: 'P1',
    type: '功能测试',
    description: '',
    tags: [],
  })

  // 加载测试用例数据
  useEffect(() => {
    const testCase = testCases.find(tc => tc.id === unwrappedParams.id)
    if (testCase) {
      setFormData({
        name: testCase.name,
        module: testCase.module,
        priority: testCase.priority,
        type: testCase.type,
        description: testCase.description,
        tags: testCase.tags,
      })
    } else {
      router.push(`/${unwrappedParams.code}/case`)
    }
  }, [unwrappedParams.id, unwrappedParams.code, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 实现更新逻辑
    router.push(`/${unwrappedParams.code}/case`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/${unwrappedParams.code}/case`}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          返回列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">编辑测试用例</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用例名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所属模块 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.module}
                onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先级 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TestCase['priority'] }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用例类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TestCase['type'] }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="功能测试">功能测试</option>
                <option value="性能测试">性能测试</option>
                <option value="接口测试">接口测试</option>
                <option value="安全测试">安全测试</option>
                <option value="兼容性测试">兼容性测试</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用例描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              placeholder="输入标签后按回车添加"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  const value = input.value.trim()
                  if (value && !formData.tags?.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...(prev.tags || []), value]
                    }))
                    input.value = ''
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags?.filter((_, i) => i !== index)
                      }))}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href={`/${unwrappedParams.code}/case`}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 