import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

type ViewMode = 'board' | 'list';

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  viewMode: ViewMode;
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  selectTask: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  tasks: [],
  selectedTaskId: null,
  viewMode: 'board',
  statusFilter: 'all',
  priorityFilter: 'all',

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  selectTask: (id) => set({ selectedTaskId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
}));
