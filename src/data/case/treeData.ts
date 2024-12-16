export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
  type: 'province' | 'city' | 'county' | 'town' | 'village'
}

export const areaTreeData: TreeNode[] = [
  {
    id: 'zj',
    name: '浙江省',
    type: 'province',
    children: [
      {
        id: 'hz',
        name: '杭州市',
        type: 'city',
        children: [
          {
            id: 'xh',
            name: '西湖区',
            type: 'county',
            children: [
              {
                id: 'xh-1',
                name: '蒋村街道',
                type: 'town',
                children: [
                  {
                    id: 'xh-1-1',
                    name: '蒋村花园',
                    type: 'village'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'js',
    name: '江苏省',
    type: 'province',
    children: [
      {
        id: 'nj',
        name: '南京市',
        type: 'city',
        children: [
          {
            id: 'gl',
            name: '鼓楼区',
            type: 'county',
            children: [
              {
                id: 'gl-1',
                name: '湖南路街道',
                type: 'town',
                children: [
                  {
                    id: 'gl-1-1',
                    name: '湖南路社区',
                    type: 'village'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
] 