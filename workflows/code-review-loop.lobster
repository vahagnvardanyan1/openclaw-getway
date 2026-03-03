# Code Review Loop Workflow
# FE implements -> PM reviews -> iterate up to 3 times

name: code-review-loop
description: Implementation and review cycle with max 3 iterations
version: "1.0"

inputs:
  task_id:
    type: string
    description: The task ID to implement and review

config:
  max_iterations: 3

steps:
  - id: implement
    agent: fe
    action: prompt
    message: |
      Implement task ${inputs.task_id}. Check the task details with list-tasks.
      Update status to "in_progress", then implement the solution.
      When done, update status to "review" and report to PM.

  - id: review
    agent: pm
    action: prompt
    message: |
      Review the FE agent's implementation for task ${inputs.task_id}.
      Check the task (status should be "review").
      Evaluate against acceptance criteria.

      If the implementation meets all criteria:
        - Use complete-task to mark it done
        - Set review_passed = true

      If revisions are needed:
        - Update the task with feedback
        - Set review_passed = false
        - Send specific feedback to the FE agent
    depends_on:
      - implement
    outputs:
      - review_passed

  - id: revision
    agent: fe
    action: prompt
    condition: "steps.review.outputs.review_passed == false"
    message: |
      The PM has requested revisions for task ${inputs.task_id}.
      Review the feedback, make the requested changes, and report back.
      Update task status back to "review" when done.
    depends_on:
      - review
    loop:
      back_to: review
      max: ${config.max_iterations}
      condition: "steps.review.outputs.review_passed == false"

  - id: complete
    agent: pm
    action: respond
    condition: "steps.review.outputs.review_passed == true"
    message: |
      Task ${inputs.task_id} has passed review. Report the completion to the user.
    depends_on:
      - review
