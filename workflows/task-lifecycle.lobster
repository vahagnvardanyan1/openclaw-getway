# Task Lifecycle Workflow
# PM analyzes user request -> creates task -> delegates to FE -> validates result -> reports to user

name: task-lifecycle
description: Full task lifecycle from user request to completion
version: "1.0"

inputs:
  task_description:
    type: string
    description: The user's task request description

steps:
  - id: analyze
    agent: pm
    action: prompt
    message: |
      Analyze this user request and create a task plan:
      "${inputs.task_description}"

      Use the create-task tool to create a task with clear requirements and acceptance criteria.
      Set appropriate priority and assign to "fe".
    outputs:
      - task_id

  - id: delegate
    agent: pm
    action: agent-send
    to: fe
    message: |
      A new task has been assigned to you. Please review the task details using list-tasks
      and begin implementation. Report back when complete.
    depends_on:
      - analyze

  - id: implement
    agent: fe
    action: prompt
    message: |
      Review your assigned tasks using list-tasks (filter by assignee: "fe", status: "pending").
      Update the task status to "in_progress" and implement the solution.
      When done, update the task status to "review" and send your implementation report to the PM.
    depends_on:
      - delegate

  - id: report_back
    agent: fe
    action: agent-send
    to: pm
    message: |
      Implementation complete. I've updated the task status to "review".
      Please review my work and validate against the acceptance criteria.
    depends_on:
      - implement

  - id: validate
    agent: pm
    action: prompt
    message: |
      The FE agent has completed implementation. Review the task (check status "review")
      and validate against the original acceptance criteria.
      If satisfactory, use complete-task to mark it done with a summary.
      If not, send revision feedback to the FE agent.
    depends_on:
      - report_back

  - id: report_to_user
    agent: pm
    action: respond
    message: |
      Report the task completion status to the user with a summary of what was accomplished.
    depends_on:
      - validate
