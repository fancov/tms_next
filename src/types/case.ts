export interface TestCase {
  id: string
  name: string
  module: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  type: string
  status: '未执行' | '执行中' | '通过' | '失败' | '阻塞'
  tags: string[]
  creator: string
  createTime: string
  lastExecuteTime?: string
  executionTime?: number
  bugCount: number
  automated: boolean
  tenantCode: string
  description: string
}

export interface TestCaseFilter {
  searchQuery?: string
  module?: string
  priority?: TestCase['priority']
  type?: string
  status?: TestCase['status']
  tags?: string[]
  automated?: boolean
  creator?: string
  dateRange?: [Date, Date]
}

export interface TestCaseSortConfig {
  field: keyof TestCase
  direction: 'asc' | 'desc'
} 