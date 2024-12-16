import { TestCase } from '@/types/case'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export const caseService = {
  // 获取租户的测试用例列表
  async getTestCases(tenantCode: string): Promise<TestCase[]> {
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch(`${API_BASE_URL}/api/${tenantCode}/cases`)
      if (!response.ok) {
        throw new Error('Failed to fetch test cases')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching test cases:', error)
      throw error
    }
  },

  // 获取单个测试用例详情
  async getTestCase(tenantCode: string, caseId: string): Promise<TestCase> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${tenantCode}/cases/${caseId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch test case')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching test case:', error)
      throw error
    }
  },

  // 创建测试用例
  async createTestCase(tenantCode: string, testCase: Omit<TestCase, 'id'>): Promise<TestCase> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${tenantCode}/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      })
      if (!response.ok) {
        throw new Error('Failed to create test case')
      }
      return response.json()
    } catch (error) {
      console.error('Error creating test case:', error)
      throw error
    }
  },

  // 更新测试用例
  async updateTestCase(tenantCode: string, caseId: string, testCase: Partial<TestCase>): Promise<TestCase> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${tenantCode}/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      })
      if (!response.ok) {
        throw new Error('Failed to update test case')
      }
      return response.json()
    } catch (error) {
      console.error('Error updating test case:', error)
      throw error
    }
  },

  // 删除测试用例
  async deleteTestCase(tenantCode: string, caseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/${tenantCode}/cases/${caseId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete test case')
      }
    } catch (error) {
      console.error('Error deleting test case:', error)
      throw error
    }
  }
} 