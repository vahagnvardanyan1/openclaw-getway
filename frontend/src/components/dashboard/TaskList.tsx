import { useMemo } from 'react';
import { useTaskStore } from '../../store/tasks';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const statusFilter = useTaskStore((s) => s.statusFilter);
  const priorityFilter = useTaskStore((s) => s.priorityFilter);
  const selectTask = useTaskStore((s) => s.selectTask);

  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    return result;
  }, [tasks, statusFilter, priorityFilter]);

  return (
    <div className="task-list-view">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((task) => (
            <tr
              key={task.id}
              className="task-row"
              onClick={() => selectTask(task.id)}
            >
              <td className="task-title-cell">{task.title}</td>
              <td><StatusBadge status={task.status} /></td>
              <td><PriorityBadge priority={task.priority} /></td>
              <td>{task.assignee === 'fe' ? 'FE Engineer' : task.assignee === 'pm' ? 'PM' : '-'}</td>
              <td>{new Date(task.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="task-table-empty">No tasks found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
