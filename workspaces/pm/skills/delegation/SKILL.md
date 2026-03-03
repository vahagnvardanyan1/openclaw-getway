# Delegation Skill

## How to Delegate
Use `sessions_spawn` to delegate tasks to sub-agents.

## Two-Step Delegation (MANDATORY)

Every implementation task requires TWO delegations:

### Step 1: Delegate to FE
```
sessions_spawn(agentId: "fe", task: "...", label: "...")
```
- Include: clear requirements, acceptance criteria, output directory
- Always tell FE: "Write all files to /Users/vahagn/Documents/other/aaaaaaa/output/"

### Step 2: Delegate to QA (after FE completes)
```
sessions_spawn(agentId: "qa", task: "...", label: "...")
```
- Include: what FE built, full file paths, what to verify
- Wait for QA's PASS/FAIL report

## Follow-up Protocol
1. After delegating to FE, wait for FE's response
2. When FE responds, IMMEDIATELY delegate to QA — do NOT report to user yet
3. Wait for QA's PASS/FAIL report
4. If QA reports FAIL: re-delegate to FE with QA's feedback, then re-test with QA
5. If QA reports PASS: report combined results to user
6. Maximum 3 revision rounds before escalating to user

**NEVER skip QA. NEVER report to user before QA verification.**
