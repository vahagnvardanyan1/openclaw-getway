import type { TaskStatus, TaskPriority } from '../../types/task';

const STATUS_STYLES: Record<TaskStatus, { bg: string; label: string }> = {
  pending: { bg: 'var(--status-pending)', label: 'Pending' },
  in_progress: { bg: 'var(--status-in-progress)', label: 'In Progress' },
  review: { bg: 'var(--status-review)', label: 'Review' },
  completed: { bg: 'var(--status-completed)', label: 'Completed' },
  blocked: { bg: 'var(--status-blocked)', label: 'Blocked' },
};

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; label: string }> = {
  critical: { bg: 'var(--priority-critical)', label: 'Critical' },
  high: { bg: 'var(--priority-high)', label: 'High' },
  medium: { bg: 'var(--priority-medium)', label: 'Medium' },
  low: { bg: 'var(--priority-low)', label: 'Low' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="badge" style={{ backgroundColor: style.bg }}>
      {style.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span className="badge" style={{ backgroundColor: style.bg }}>
      {style.label}
    </span>
  );
}
