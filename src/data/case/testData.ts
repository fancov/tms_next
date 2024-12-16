import { format } from 'date-fns'

export interface TestCase {
  id: string
  name: string
  module: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  type: '功能测试' | '性能测试' | '接口测试' | '安全测试' | '兼容性测试'
  status: '未执行' | '通过' | '失败' | '阻塞' | '执行中'
  creator: string
  createTime: string
  lastExecuteTime?: string
  description: string
  tags: string[]
  executionTime?: number // 执行时长(秒)
  bugCount: number // 关联缺陷数
  automated: boolean // 是否自动化
  tenantCode: string
}

// 使用固定的种子数据
const testCasesData = [
  {
    id: 'TC-001',
    name: '用户登录-功能测试-001',
    module: '用户管理',
    priority: 'P0' as const,
    type: '功能测试' as const,
    status: '通过' as const,
    creator: '张三',
    createTime: '2024-03-01',
    lastExecuteTime: '2024-03-20',
    description: '验证用户使用正确的用户名和密码能够成功登录系统',
    tags: ['冒烟测试', '核心流程'],
    executionTime: 120,
    bugCount: 0,
    automated: true
  },
  {
    id: 'TC-002',
    name: '商品搜索-性能测试-001',
    module: '商品管理',
    priority: 'P1' as const,
    type: '性能测试' as const,
    status: '失败' as const,
    creator: '李四',
    createTime: '2024-03-02',
    lastExecuteTime: '2024-03-21',
    description: '验证商品搜索接口的响应时间在500ms以内',
    tags: ['性能监控', '核心流程'],
    executionTime: 180,
    bugCount: 2,
    automated: true
  },
  {
    id: 'TC-003',
    name: '支付接口-接口测试-001',
    module: '支付系统',
    priority: 'P0' as const,
    type: '接口测试' as const,
    status: '阻塞' as const,
    creator: '王五',
    createTime: '2024-03-03',
    lastExecuteTime: '2024-03-22',
    description: '验证支付接口的数据完整性和安全性',
    tags: ['接口测试', '安全扫描'],
    executionTime: 90,
    bugCount: 1,
    automated: true
  },
  {
    id: 'TC-004',
    name: '订单创建-功能测试-001',
    module: '订单管理',
    priority: 'P1' as const,
    type: '功能测试' as const,
    status: '未执行' as const,
    creator: '赵六',
    createTime: '2024-03-04',
    lastExecuteTime: undefined,
    description: '验证用户能够成功创建订单',
    tags: ['回归测试', '边界场景'],
    executionTime: undefined,
    bugCount: 0,
    automated: false
  },
  {
    id: 'TC-005',
    name: '库存同步-接口测试-001',
    module: '库存管理',
    priority: 'P2' as const,
    type: '接口测试' as const,
    status: '执行中' as const,
    creator: '钱七',
    createTime: '2024-03-05',
    lastExecuteTime: '2024-03-23',
    description: '验证库存数据同步的准确性',
    tags: ['异常场景', '数据一致性'],
    executionTime: 150,
    bugCount: 0,
    automated: true
  }
]

// 生成固定的300条数据（每个租户100条）
export const testCases: TestCase[] = ['dio', 'ccs', 'pit'].flatMap(tenantCode => 
  Array.from({ length: 100 }, (_, index) => {
    const baseCase = testCasesData[index % testCasesData.length]
    return {
      ...baseCase,
      id: `${tenantCode.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
      name: `${baseCase.module}-${baseCase.type.replace('测试', '')}-${String(index + 1).padStart(3, '0')}`,
      createTime: format(new Date(2024, 0, 1 + Math.floor(index / 3)), 'yyyy-MM-dd'),
      lastExecuteTime: index % 5 === 0 ? undefined : format(new Date(2024, 2, 1 + Math.floor(index / 3)), 'yyyy-MM-dd'),
      bugCount: Math.floor(index / 20), // 每20个用例增加一个缺陷
      automated: index % 3 === 0, // 每3个用例设置一个为自动化
      tenantCode
    }
  })
) 