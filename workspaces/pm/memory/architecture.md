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
- FE writes output to /Users/vahagn/Documents/other/aaaaaaa/output/
- FE reports back to PM via sub-agent announce
- PM delegates to QA via `sessions_spawn(agentId: "qa")`
- QA reads files from output directory, tests them
- QA reports PASS/FAIL back to PM via sub-agent announce
- PM responds to user with combined results
- Neither FE nor QA communicate with user directly
