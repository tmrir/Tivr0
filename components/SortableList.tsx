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
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchStartIndex(index);
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIndex === null) return;
    
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (elementBelow) {
      const dragItem = elementBelow.closest('[data-drag-item]');
      if (dragItem) {
        const newIndex = parseInt(dragItem.getAttribute('data-drag-index') || '0');
        if (newIndex !== touchStartIndex) {
          setDragOverIndex(newIndex);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStartIndex !== null && dragOverIndex !== null && touchStartIndex !== dragOverIndex) {
      const newItems = [...items];
      const draggedItem = newItems[touchStartIndex];
      newItems.splice(touchStartIndex, 1);
      newItems.splice(dragOverIndex, 0, draggedItem);
      onReorder(newItems);
    }
    setTouchStartIndex(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
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

    newItems.splice(draggedIndex, 1);
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
          data-drag-item
          data-drag-index={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`transition-transform duration-200 ease-in-out touch-manipulation ${
            draggedIndex === index ? 'opacity-50 scale-95 bg-slate-100' : ''
          } ${
            dragOverIndex === index ? 'border-t-2 border-tivro-primary' : ''
          }`}
        >
          <div className="relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 touch-pan-y">
              <GripVertical size={20} />
            </div>
            <div className="pl-8">
                {renderItem(item, index, draggedIndex === index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}