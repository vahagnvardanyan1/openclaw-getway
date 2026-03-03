# System Architecture

## Overview
Hierarchical multi-agent system: User -> PM -> FE -> PM -> QA -> PM -> User

## Components
- **OpenClaw Gateway** (port 18789): Agent lifecycle, communication, memory
- **Bridge Server** (port 3001): Fastify HTTP/WS server connecting frontend to gateway
- **React Frontend** (port 5173): Chat + Task Dashboard SPA
- **SQLite DB**: Shared task storage (plugins/task-manager)

## Agent Communication
- PM receives user messages via webchat binding
- PM delegates to FE via `sessions_spawn(agentId: "fe")`
- FE writes output to {{PROJECT_ROOT}}/output/
- FE reports back to PM via sub-agent announce
- PM delegates to QA via `sessions_spawn(agentId: "qa")`
- QA reads files from output directory, tests them comprehensively
- QA reports structured PASS/FAIL back to PM via sub-agent announce
- PM responds to user with combined results
- Neither FE nor QA communicate with user directly

## QA Testing Scope
- Functional: requirements traceability, logic correctness
- Security: XSS vectors, data exposure, input validation
- Accessibility: WCAG 2.1 AA compliance
- Performance: asset sizes, DOM complexity
- Code Quality: clean code, modern patterns
- Standards: HTML/CSS/JS best practices
