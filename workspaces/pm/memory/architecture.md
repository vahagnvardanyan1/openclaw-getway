# System Architecture

## Overview
Hierarchical multi-agent system: User -> PM -> FE -> PM -> User

## Components
- **OpenClaw Gateway** (port 18789): Agent lifecycle, communication, memory
- **Bridge Server** (port 3001): Fastify HTTP/WS server connecting frontend to gateway
- **React Frontend** (port 5173): Chat + Task Dashboard SPA
- **SQLite DB**: Shared task storage (plugins/task-manager)

## Agent Communication
- PM receives user messages via webchat binding
- PM delegates to FE via agent-send
- FE reports back to PM via agent-send
- PM responds to user with results
- FE never communicates with user directly
