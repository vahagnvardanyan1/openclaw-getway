import { useMemo } from 'react';
import { useTaskStore } from '../../store/tasks';
import { TaskCard } from './TaskCard';
import type { TaskStatus } from '../../types/task';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'review', label: 'Review' },
  { status: 'completed', label: 'Completed' },
  { status: 'blocked', label: 'Blocked' },
];

export function TaskBoard() {
  const tasks = useTaskStore((s) => s.tasks);
  const priorityFilter = useTaskStore((s) => s.priorityFilter);

  const filtered = useMemo(() => {
    if (priorityFilter === 'all') return tasks;
    return tasks.filter((t) => t.priority === priorityFilter);
  }, [tasks, priorityFilter]);

  return (
    <div className="task-board">
      {COLUMNS.map((col) => {
        const columnTasks = filtered.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="board-column">
            <div className="board-column-header">
              <h3>{col.label}</h3>
              <span className="column-count">{columnTasks.length}</span>
            </div>
            <div className="board-column-body">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
