import { useEffect } from 'react';
import { useTaskStore } from '../../store/tasks';
import { api } from '../../api/client';
import { ViewToggle } from './ViewToggle';
import { TaskBoard } from './TaskBoard';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';

export function TaskDashboard() {
  const viewMode = useTaskStore((s) => s.viewMode);
  const setTasks = useTaskStore((s) => s.setTasks);
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const statusFilter = useTaskStore((s) => s.statusFilter);
  const priorityFilter = useTaskStore((s) => s.priorityFilter);
  const setStatusFilter = useTaskStore((s) => s.setStatusFilter);
  const setPriorityFilter = useTaskStore((s) => s.setPriorityFilter);

  useEffect(() => {
    const fetchTasks = () => {
      api.listTasks().then((res) => setTasks(res.tasks)).catch(() => {});
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [setTasks]);

  return (
    <div className="task-dashboard">
      <div className="panel-header">
        <h2>Tasks</h2>
        <div className="dashboard-controls">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ViewToggle />
        </div>
      </div>
      <div className="dashboard-body">
        {viewMode === 'board' ? <TaskBoard /> : <TaskList />}
      </div>
      {selectedTaskId && <TaskDetail />}
    </div>
  );
}
