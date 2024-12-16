'use client'

import { useState } from 'react'
import { Settings, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface ColumnDef {
  key: string
  title: string
  visible: boolean
  fixed?: boolean
}

interface ColumnConfigProps {
  columns: ColumnDef[]
  onChange: (columns: ColumnDef[]) => void
}

// 可排序的列项组件
const SortableColumnItem = ({ column }: { column: ColumnDef }) => {
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
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <label className="flex items-center flex-1">
        <input
          type="checkbox"
          checked={column.visible}
          disabled={column.fixed}
          className="mr-2"
          readOnly
        />
        <span className="text-sm">{column.title}</span>
      </label>
    </div>
  )
}

export function ColumnConfig({ columns, onChange }: ColumnConfigProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = columns.findIndex((col) => col.key === active.id)
    const newIndex = columns.findIndex((col) => col.key === over.id)

    onChange(arrayMove(columns, oldIndex, newIndex))
  }

  const toggleColumn = (key: string) => {
    const newColumns = columns.map(col => 
      col.key === key && !col.fixed ? { ...col, visible: !col.visible } : col
    )
    onChange(newColumns)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-md"
        title="列配置"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0" 
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h3 className="font-medium mb-4">列配置</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map(col => col.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {columns.map((column) => (
                      <div 
                        key={column.key} 
                        onClick={() => toggleColumn(column.key)}
                      >
                        <SortableColumnItem column={column} />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 