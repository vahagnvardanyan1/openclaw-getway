# Task Management Skill

## Tools Available
- `task-manager:create-task` - Create a new task with title, description, priority, assignee
- `task-manager:update-task` - Update task status, description, or assignee
- `task-manager:list-tasks` - List tasks with optional filters (status, assignee, priority)
- `task-manager:complete-task` - Mark a task as completed with a summary

## Task Lifecycle
1. **pending** - Task created, not yet started
2. **in_progress** - Task actively being worked on
3. **review** - Implementation complete, awaiting PM validation
4. **completed** - Task validated and done
5. **blocked** - Task cannot proceed, needs intervention

## Best Practices
- Always set a clear priority when creating tasks
- Include measurable acceptance criteria
- Update task status promptly when delegation occurs
- Track task IDs for follow-up validation
