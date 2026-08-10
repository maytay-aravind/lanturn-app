import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

/* ── Sortable Card Wrapper ───────────────────────────────────── */
function SortableCard({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

/* ── Droppable Column ────────────────────────────────────────── */
function DroppableColumn({ column, items, renderCard, totalItems }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] max-w-[340px] flex flex-col rounded-2xl border-2 transition-all duration-200 ${
        isOver
          ? 'border-indigo-400 bg-indigo-50/50 shadow-lg shadow-indigo-100'
          : 'border-slate-200 bg-slate-50/80'
      }`}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-bold text-slate-800 flex-1 truncate">
          {column.title}
        </h3>
        <span className="text-xs font-semibold text-slate-400 bg-white rounded-full px-2 py-0.5 border border-slate-200">
          {items.length}
        </span>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[120px] max-h-[65vh]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id}>
              {renderCard(item)}
            </SortableCard>
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400 italic">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main KanbanBoard ────────────────────────────────────────── */
export default function KanbanBoard({
  columns,
  items,
  getItemColumn,
  onDragEnd,
  renderCard,
  renderDragOverlay,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const itemsByColumn = {};
  columns.forEach((col) => {
    itemsByColumn[col.id] = items.filter((item) => getItemColumn(item) === col.id);
  });

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeItemObj = items.find((i) => i.id === active.id);
    if (!activeItemObj) return;

    // Determine the target column
    let targetColumnId = null;

    // Check if dropped on a column directly
    if (columns.some((c) => c.id === over.id)) {
      targetColumnId = over.id;
    } else {
      // Dropped on another card — find which column that card is in
      const overItem = items.find((i) => i.id === over.id);
      if (overItem) {
        targetColumnId = getItemColumn(overItem);
      }
    }

    if (!targetColumnId) return;

    const sourceColumnId = getItemColumn(activeItemObj);
    if (sourceColumnId === targetColumnId) return;

    onDragEnd({
      itemId: active.id,
      item: activeItemObj,
      fromColumn: sourceColumnId,
      toColumn: targetColumnId,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {columns.map((col) => (
          <DroppableColumn
            key={col.id}
            column={col}
            items={itemsByColumn[col.id] || []}
            renderCard={renderCard}
            totalItems={items.length}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem && renderDragOverlay
          ? renderDragOverlay(activeItem)
          : activeItem
          ? renderCard(activeItem)
          : null}
      </DragOverlay>
    </DndContext>
  );
}
