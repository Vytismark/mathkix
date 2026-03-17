'use client'

import { useState } from 'react'

interface SorterItem {
  id:    string
  label: string
  value: number
}

interface DragDropSorterProps {
  items:     SorterItem[]
  onOrder:   (orderedIds: string[]) => void
  disabled?: boolean
  label?:    string
  className?: string
}

/**
 * Drag-and-drop (or tap-to-reorder) sorter for ordering numbers/items.
 * Children drag tiles to arrange them in a sequence.
 *
 * Content-agnostic shell: questions using this will be added with content.
 *
 * Touch-friendly: tap a tile twice to pick it up, then tap the target position.
 */
export function DragDropSorter({
  items: initialItems,
  onOrder,
  disabled = false,
  label,
  className = '',
}: DragDropSorterProps) {
  const [orderedItems, setOrderedItems] = useState<SorterItem[]>(initialItems)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)  // touch mode

  const move = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const from = orderedItems.findIndex((i) => i.id === fromId)
    const to   = orderedItems.findIndex((i) => i.id === toId)
    if (from === -1 || to === -1) return
    const updated = [...orderedItems]
    const [item] = updated.splice(from, 1)
    updated.splice(to, 0, item)
    setOrderedItems(updated)
    onOrder(updated.map((i) => i.id))
  }

  // Drag handlers (mouse/trackpad)
  const handleDragStart = (id: string) => setDraggingId(id)
  const handleDragEnd   = ()           => setDraggingId(null)
  const handleDragOver  = (e: React.DragEvent) => e.preventDefault()
  const handleDrop      = (toId: string) => {
    if (draggingId && draggingId !== toId) move(draggingId, toId)
    setDraggingId(null)
  }

  // Tap-to-select handler (touch/keyboard)
  const handleTap = (id: string) => {
    if (disabled) return
    if (!selectedId) {
      setSelectedId(id)
    } else if (selectedId === id) {
      setSelectedId(null)
    } else {
      move(selectedId, id)
      setSelectedId(null)
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && <p className="text-sm font-medium text-gray-700 text-center">{label}</p>}

      <div className="flex flex-wrap gap-2 justify-center">
        {orderedItems.map((item) => {
          const isSelected = selectedId === item.id
          const isDragging = draggingId === item.id
          return (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(item.id)}
              onClick={() => handleTap(item.id)}
              className={[
                'flex items-center justify-center w-14 h-14 rounded-xl border-2 text-lg font-bold',
                'transition-all duration-150 cursor-grab active:cursor-grabbing select-none',
                disabled        ? 'opacity-60 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                : isSelected    ? 'border-indigo-600 bg-indigo-100 text-indigo-800 scale-110 shadow-lg ring-2 ring-indigo-400'
                : isDragging    ? 'border-purple-400 bg-purple-50 text-purple-700 opacity-60 scale-105'
                : 'border-gray-300 bg-white text-gray-800 hover:border-indigo-400 hover:bg-indigo-50',
              ].join(' ')}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`${item.label}, position ${orderedItems.indexOf(item) + 1} of ${orderedItems.length}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(item.id) } }}
            >
              {item.label}
            </div>
          )
        })}
      </div>

      {selectedId && (
        <p className="text-xs text-center text-indigo-500 animate-pulse">
          Tap where you want to move it
        </p>
      )}
    </div>
  )
}
