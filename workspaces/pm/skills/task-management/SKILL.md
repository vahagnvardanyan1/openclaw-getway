# Task Management Skill

## Tools Available
- `task-manager:create-task` - Create a new task with title, description, priority, assignee
- `task-manager:update-task` - Update task status, description, or assignee
- `task-manager:list-tasks` - List tasks with optional filters (status, assignee, priority)
- `task-manager:complete-task` - Mark a task as completed with a summary

## Task Lifecycle
1. **pending** - Task created, not yet started
2. **in_progress** - Task actively being worked on (FE building)
3. **review** - Implementation complete, QA testing in progress
4. **completed** - Task tested by QA and validated
5. **blocked** - Task cannot proceed, needs intervention

## MANDATORY: QA Testing After Every Task

After the FE agent completes ANY task, you MUST delegate to QA for testing before marking it complete:

1. FE finishes → update task status to `review`
2. Call `sessions_spawn` with `agentId: "qa"` — tell QA what FE built and what to verify
3. QA reports PASS → mark task `completed`
4. QA reports FAIL → delegate back to FE with QA's failure details, then re-test with QA

**Never skip QA. Never mark a task as completed without a QA PASS.**

## Best Practices
- Always set a clear priority when creating tasks
- Include measurable acceptance criteria
- Update task status promptly when delegation occurs
- Track task IDs for follow-up validation
- Always include file paths and acceptance criteria when delegating to QA
