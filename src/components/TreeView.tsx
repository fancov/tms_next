'use client'

import { ChevronRight, ChevronDown, Folder, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { TreeNode } from '@/data/case/treeData'

interface TreeViewProps {
  node: TreeNode
  searchTerm?: string
}

interface TreeViewItemProps extends TreeViewProps {
  isLast: boolean
  level?: number
}

// 高亮显示匹配的文本
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

// 检查节点或其子节点是否包含搜索词
const nodeContainsText = (node: TreeNode, searchText: string): boolean => {
  if (node.name.toLowerCase().includes(searchText.toLowerCase())) {
    return true
  }
  if (node.children) {
    return node.children.some(child => nodeContainsText(child, searchText))
  }
  return false
}

const TreeViewItem = ({ node, level = 0, isLast, searchTerm = '' }: TreeViewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0
  const paddingLeft = level * 20

  // 当搜索词变化时，自动展开包含匹配项的节点
  useEffect(() => {
    if (searchTerm && nodeContainsText(node, searchTerm)) {
      setIsExpanded(true)
    } else if (!searchTerm) {
      setIsExpanded(false)
    }
  }, [searchTerm, node])

  const getIconColor = (type: TreeNode['type']) => {
    switch (type) {
      case 'province': return 'text-blue-600'
      case 'city': return 'text-green-600'
      case 'county': return 'text-yellow-600'
      case 'town': return 'text-purple-600'
      case 'village': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer select-none"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <div className="w-4 h-4 mr-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        ) : (
          <div className="w-4 h-4 mr-1" />
        )}
        <Folder className={`w-4 h-4 mr-2 ${getIconColor(node.type)}`} />
        <span className="text-sm">
          <HighlightText text={node.name} highlight={searchTerm} />
        </span>
      </div>
      
      {isExpanded && node.children && (
        <div>
          {node.children.map((child, index: number) => (
            <TreeViewItem
              key={child.id}
              node={child}
              level={level + 1}
              isLast={index === node.children!.length - 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ node, searchTerm }: TreeViewProps) {
  return <TreeViewItem node={node} isLast={true} searchTerm={searchTerm} />
} 