import type { Task } from '../../types/task';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { useTaskStore } from '../../store/tasks';

interface Props {
  task: Task;
}

export function TaskCard({ task }: Props) {
  const selectTask = useTaskStore((s) => s.selectTask);

  return (
    <div className="task-card" onClick={() => selectTask(task.id)} role="button" tabIndex={0}>
      <div className="task-card-header">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
      <h4 className="task-card-title">{task.title}</h4>
      <p className="task-card-desc">{task.description.slice(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
      <div className="task-card-footer">
        {task.assignee && (
          <span className="task-assignee">
            {task.assignee === 'fe' ? 'FE Engineer' : 'PM'}
          </span>
        )}
        <time className="task-time">
          {new Date(task.created_at).toLocaleDateString()}
        </time>
      </div>
    </div>
  );
}
