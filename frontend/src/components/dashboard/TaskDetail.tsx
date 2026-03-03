import { useEffect, useState } from 'react';
import { useTaskStore } from '../../store/tasks';
import { api } from '../../api/client';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import type { TaskEvent } from '../../types/task';

export function TaskDetail() {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const selectTask = useTaskStore((s) => s.selectTask);
  const [events, setEvents] = useState<TaskEvent[]>([]);

  const task = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (!selectedTaskId) return;
    api.getTask(selectedTaskId).then((res) => {
      setEvents(res.events as TaskEvent[]);
    }).catch(() => setEvents([]));
  }, [selectedTaskId]);

  if (!task) return null;

  return (
    <div className="task-detail-overlay" onClick={() => selectTask(null)}>
      <div className="task-detail" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h3>{task.title}</h3>
          <button className="btn btn-sm" onClick={() => selectTask(null)}>
            Close
          </button>
        </div>
        <div className="task-detail-badges">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.assignee && (
            <span className="task-assignee-detail">
              Assigned to: {task.assignee === 'fe' ? 'FE Engineer' : task.assignee === 'qa' ? 'QA Engineer' : 'PM'}
            </span>
          )}
        </div>
        <div className="task-detail-body">
          <MarkdownRenderer content={task.description} />
        </div>
        {task.completion_summary && (
          <div className="task-detail-summary">
            <h4>Completion Summary</h4>
            <MarkdownRenderer content={task.completion_summary} />
          </div>
        )}
        {events.length > 0 && (
          <div className="task-detail-events">
            <h4>Activity</h4>
            <ul className="event-list">
              {events.map((evt) => (
                <li key={evt.id} className="event-item">
                  <span className="event-type">{evt.event_type}</span>
                  <span className="event-agent">{evt.agent_id}</span>
                  <time className="event-time">
                    {new Date(evt.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
