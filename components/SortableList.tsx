
import React, { useState, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface SortableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function SortableList<T>({ items, onReorder, renderItem, keyExtractor, className = '' }: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = "move";
    // Create a ghost image if needed, or let browser handle it
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null) return;
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove item from old position
    newItems.splice(draggedIndex, 1);
    // Insert item at new position
    newItems.splice(index, 0, draggedItem);

    onReorder(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, items, onReorder]);

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`transition-transform duration-200 ease-in-out ${
            draggedIndex === index ? 'opacity-50 scale-95 bg-slate-100' : ''
          } ${
            dragOverIndex === index ? 'border-t-2 border-tivro-primary' : ''
          }`}
        >
          <div className="relative group">
            {/* Drag Handle - Only visible on hover or when dragging */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-2">
              <GripVertical size={20} />
            </div>
            
            {/* Render the actual card content */}
            <div className="pl-8">
                {renderItem(item, index, draggedIndex === index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
