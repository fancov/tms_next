'use client'

import React, { useState, useCallback, useEffect, Suspense, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight, Plus, X, MoreHorizontal } from 'lucide-react'
import { TreeView } from '@/components/TreeView'
import { areaTreeData } from '@/data/case/treeData'
import { testCases, TestCase } from '@/data/case/testData'
import { ColumnConfig, type ColumnDef } from '@/components/ColumnConfig'
import { useTenantData } from '@/hooks/useTenantData'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 创建一个加载状态组件
function LoadingState() {
  return (
    <div className="flex-1 p-4">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 分页控制器组件
const Pagination = React.memo(({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems,
  onPageChange, 
  onPageSizeChange 
}: {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
    <div className="flex items-center">
      <select
        className="border rounded px-2 py-1 text-sm"
        value={pageSize}
        onChange={(e) => {
          onPageSizeChange(Number(e.target.value))
          onPageChange(1)
        }}
      >
        {[10, 20, 50, 100].map(size => (
          <option key={size} value={size}>
            显示 {size} 条
          </option>
        ))}
      </select>
      <span className="ml-4 text-sm text-gray-700">
        共 {totalItems} 条记录
      </span>
    </div>

    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <span className="text-sm text-gray-700">
        第 {currentPage} 页，共 {totalPages} 页
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  </div>
))

Pagination.displayName = 'Pagination'

// 搜索框组件
const SearchInput = React.memo(({ 
  value, 
  onChange,
  placeholder 
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) => (
  <div className="relative flex-1">
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 pl-9 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
  </div>
))

SearchInput.displayName = 'SearchInput'

// 创建用例弹框组件
const CreateCaseModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<TestCase>) => void
}) => {
  const [formData, setFormData] = useState<Partial<TestCase>>({
    name: '',
    module: '',
    priority: 'P1',
    type: '功能测试',
    description: '',
    tags: [],
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">创建测试用例</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
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
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 编辑用例抽屉组件
const EditCaseDrawer = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<TestCase>) => void
  initialData: TestCase
}) => {
  const [formData, setFormData] = useState<Partial<TestCase>>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[600px] bg-slate-100 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-white shadow-sm">
          <h2 className="text-xl font-semibold">编辑测试用例</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1">
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
                  className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TestCase['priority'] }))}
                  className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
              >
                取消
              </button>
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
    </div>
  )
}

// Update SortableTableHeader component to use proper table elements
const SortableTableHeader = ({ 
  column,
  onToggleFixed,
}: { 
  column: ColumnDef
  onToggleFixed: () => void
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-6 py-3 text-left text-sm font-medium text-gray-500 relative group cursor-move"
      {...attributes}
      {...listeners}
    >
      <span className="flex items-center gap-2">
        {column.title}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="opacity-0 group-hover:opacity-100 hover:bg-gray-100 p-1 rounded"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </span>
      
      {showMenu && (
        <div className="fixed inset-0" onClick={() => setShowMenu(false)}>
          <div 
            className="absolute left-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 py-1 min-w-[120px]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onToggleFixed()
                setShowMenu(false)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              {column.fixed ? '取消固定' : '固定列'}
            </button>
          </div>
        </div>
      )}
    </th>
  )
}

function CasePageContent({
  params
}: {
  params: { code: string }
}) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params)

  // 1. All useState hooks first
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [columns, setColumns] = useState<ColumnDef[]>([
    { key: 'id', title: 'ID', visible: true, fixed: true },
    { key: 'name', title: '用例名称', visible: true, fixed: true },
    { key: 'module', title: '所属模块', visible: true },
    { key: 'priority', title: '优先级', visible: true },
    { key: 'type', title: '类型', visible: true },
    { key: 'status', title: '状态', visible: true },
    { key: 'tags', title: '标签', visible: true },
    { key: 'creator', title: '创建人', visible: true },
    { key: 'createTime', title: '创建时间', visible: true },
    { key: 'lastExecuteTime', title: '最后执行', visible: true },
    { key: 'executionTime', title: '执行时长', visible: true },
    { key: 'bugCount', title: '缺陷数', visible: true },
    { key: 'automated', title: '自动化', visible: true },
  ])

  // Add state for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCase, setEditingCase] = useState<TestCase | null>(null)

  // 2. Custom hooks (including useTenantData which uses useContext internally)
  const fetchTestCases = useCallback(async (tenantCode: string) => {
    return testCases.filter(testCase => testCase.tenantCode === tenantCode)
  }, [])

  const { data: tenantCases, isLoading } = useTenantData<TestCase[]>(fetchTestCases, [])

  // 3. useCallback hooks
  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(sidebarWidth)
  }, [sidebarWidth])

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const diff = e.clientX - startX
    const newWidth = Math.max(200, Math.min(800, startWidth + diff))
    setSidebarWidth(newWidth)
  }, [isResizing, startX, startWidth])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed)
    if (!isCollapsed) {
      setSidebarWidth(0)
    } else {
      setSidebarWidth(256)
    }
  }, [isCollapsed])

  // 4. useEffect hooks
  useEffect(() => {
    document.addEventListener('mousemove', resize)
    document.addEventListener('mouseup', stopResizing)
    
    return () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // 使用 useMemo 优化过滤后的数据
  const filteredCases = useMemo(() => 
    (tenantCases || []).filter(testCase => 
      testCase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.creator.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [tenantCases, searchQuery]
  )

  // 使用 useMemo 优化分页数据
  const { totalPages, paginatedCases } = useMemo(() => ({
    totalPages: Math.ceil(filteredCases.length / pageSize),
    paginatedCases: filteredCases.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    )
  }), [filteredCases, currentPage, pageSize])

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // 处理每页显示数量变化
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
  }, [])

  // 处理搜索查询变化
  const handleSearchQueryChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  // 处理区域搜索变化
  const handleAreaSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  // 使用 useMemo 优化表格列配置
  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible),
    [columns]
  )

  // Add handler for form submission
  const handleCreateCase = (data: Partial<TestCase>) => {
    // TODO: Implement case creation logic
    console.log('Creating case:', data)
  }

  // Add handler for edit form submission
  const handleEditCase = (data: Partial<TestCase>) => {
    // TODO: Implement case update logic
    console.log('Updating case:', data)
  }

  // 渲染表格单元格
  const renderCell = (testCase: TestCase, column: ColumnDef) => {
    switch (column.key) {
      case 'id':
        return (
          <td key={column.key} className="px-6 py-4 text-sm font-medium">
            <button
              onClick={() => {
                setEditingCase(testCase)
                setIsEditModalOpen(true)
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {testCase.id}
            </button>
          </td>
        )
      case 'name':
        return (
          <td key={column.key} className="px-6 py-4 text-sm max-w-xs truncate" title={testCase.name}>
            {testCase.name}
          </td>
        )
      case 'module':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.module}</td>
      case 'priority':
        return (
          <td key={column.key} className="px-6 py-4 text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${testCase.priority === 'P0' ? 'bg-red-100 text-red-800' :
                testCase.priority === 'P1' ? 'bg-yellow-100 text-yellow-800' :
                testCase.priority === 'P2' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}`}>
              {testCase.priority}
            </span>
          </td>
        )
      case 'type':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.type}</td>
      case 'status':
        return (
          <td key={column.key} className="px-6 py-4 text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${testCase.status === '通过' ? 'bg-green-100 text-green-800' :
                testCase.status === '失败' ? 'bg-red-100 text-red-800' :
                testCase.status === '阻塞' ? 'bg-yellow-100 text-yellow-800' :
                testCase.status === '执行中' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}`}>
              {testCase.status}
            </span>
          </td>
        )
      case 'tags':
        return (
          <td key={column.key} className="px-6 py-4 text-sm">
            <div className="flex flex-wrap gap-1">
              {testCase.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          </td>
        )
      case 'creator':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.creator}</td>
      case 'createTime':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.createTime}</td>
      case 'lastExecuteTime':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.lastExecuteTime || '-'}</td>
      case 'executionTime':
        return <td key={column.key} className="px-6 py-4 text-sm">{testCase.executionTime ? `${testCase.executionTime}s` : '-'}</td>
      case 'bugCount':
        return (
          <td key={column.key} className="px-6 py-4 text-sm">
            {testCase.bugCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                {testCase.bugCount}
              </span>
            ) : '-'}
          </td>
        )
      case 'automated':
        return (
          <td key={column.key} className="px-6 py-4 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              testCase.automated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {testCase.automated ? '是' : '否'}
            </span>
          </td>
        )
      default:
        return <td key={column.key} className="px-6 py-4 text-sm">-</td>
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = columns.findIndex((col) => col.key === active.id)
    const newIndex = columns.findIndex((col) => col.key === over.id)

    setColumns(arrayMove(columns, oldIndex, newIndex))
  }

  const toggleColumnFixed = (key: string) => {
    setColumns(columns.map(col => 
      col.key === key ? { ...col, fixed: !col.fixed } : col
    ))
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左侧文件夹区域 */}
      <div 
        className={`bg-gray-50 flex-shrink-0 h-full ${isCollapsed ? 'w-0 overflow-hidden' : ''}`}
        style={{ 
          width: sidebarWidth,
          transition: isResizing ? 'none' : undefined
        }}
      >
        <div className="p-4">
          <SearchInput
            value={searchTerm}
            onChange={handleAreaSearchChange}
            placeholder="搜索区域..."
          />
          <div className="space-y-1 mt-4 overflow-y-auto" style={{ height: 'calc(100vh - 12rem)' }}>
            {areaTreeData.map((node) => (
              <TreeView 
                key={node.id} 
                node={node} 
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 折叠/展开按钮 */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border rounded-r-md p-1 
          hover:bg-gray-100 focus:outline-none z-10 shadow-md"
        style={{ 
          left: isCollapsed ? '0' : `${sidebarWidth}px`,
          transition: isResizing ? 'none' : undefined
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* 可拖动的隔线 */}
      {!isCollapsed && (
        <div
          className={`w-1 bg-gray-200 hover:bg-blue-500 active:bg-blue-700 h-full cursor-col-resize
            ${isResizing ? 'bg-blue-700' : ''}`}
          onMouseDown={startResizing}
          style={{
            transition: isResizing ? 'none' : undefined
          }}
        />
      )}

      {/* 右侧表格区域 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 搜索和列配置区域 - 固定在顶部 */}
        <div className="flex-none p-2 border-b bg-white flex justify-between items-center">
          <div className="flex items-center flex-1 gap-4">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchQueryChange}
              placeholder="搜索测试用例..."
            />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建用例
            </button>
          </div>
          <ColumnConfig columns={columns} onChange={setColumns} />
        </div>

        {/* 表格区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col h-full">
              {/* 表头固定 */}
              <div className="flex-none bg-white">
                <table className="min-w-full table-fixed">
                  <thead className="bg-white border-b shadow-sm">
                    <SortableContext
                      items={visibleColumns.map(col => col.key)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <tr>
                        {visibleColumns.map(column => (
                          <SortableTableHeader
                            key={column.key}
                            column={column}
                            onToggleFixed={() => toggleColumnFixed(column.key)}
                          />
                        ))}
                      </tr>
                    </SortableContext>
                  </thead>
                </table>
              </div>

              {/* 表格内容可滚动 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <table className="min-w-full table-fixed">
                  <tbody>
                    {paginatedCases.map((testCase) => (
                      <tr key={testCase.id} className="border-b hover:bg-gray-50">
                        {visibleColumns.map(column => renderCell(testCase, column))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页控制器 - 固定在底部 */}
              <div className="flex-none bg-white border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredCases.length}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>
          </DndContext>
        </div>
      </div>

      {/* Add CreateCaseModal */}
      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCase}
      />

      {/* Add EditCaseDrawer */}
      {editingCase && (
        <EditCaseDrawer
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingCase(null)
          }}
          onSubmit={handleEditCase}
          initialData={editingCase}
        />
      )}
    </div>
  )
}

// 包装组件
export default function CasePage({
  params
}: {
  params: { code: string }
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <CasePageContent params={params} />
    </Suspense>
  )
} 