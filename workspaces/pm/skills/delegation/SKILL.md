# Delegation Skill

## How to Delegate
Use `agent-send` to send structured task assignments to the FE agent.

## Message Format
Always include:
1. Task ID (from task-manager)
2. Clear requirements list
3. Acceptance criteria
4. Any relevant context or constraints

## Follow-up Protocol
1. After delegating, wait for the FE agent's response
2. Review the response against acceptance criteria
3. If criteria not met, provide specific feedback and re-delegate
4. Maximum 3 revision rounds before escalating to user
5. Once satisfied, mark the task complete and report to user

## Example Delegation
```
agent-send to "fe":
TASK: Implement login form component
ID: task-123
REQUIREMENTS:
- Email and password fields with validation
- Submit button with loading state
- Error message display
ACCEPTANCE CRITERIA:
- Form validates email format
- Password minimum 8 characters
- Shows loading spinner during submission
- Displays API errors to user
```
