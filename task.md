You are building a project that includes both frontend and backend, structured using OpenClaw for agent orchestration and workflow management.

Your goal is to implement a hierarchical multi-agent system with maximum reuse of the OpenClaw package.

⸻

1️⃣ Architecture Requirements

The system must include:

Agents
	•	Product Manager (PM)
	•	Frontend Engineer (FE)

The system must follow a strict hierarchical communication flow:

User → Product Manager → Frontend Engineer
Frontend Engineer → Product Manager → User

The Frontend Engineer must never communicate directly with the User.

⸻

2️⃣ Task Workflow

Step 1 — User Interaction
	•	The User assigns a task to the Product Manager.

Step 2 — Product Manager Responsibilities

The PM must:
	•	Analyze the task
	•	Ask clarifying questions if necessary
	•	Break the task into subtasks
	•	Validate alignment with system architecture
	•	Assign implementation tasks to the Frontend Engineer

Step 3 — Frontend Engineer Responsibilities

The FE must:
	•	Implement assigned tasks
	•	Reuse OpenClaw code wherever possible
	•	Avoid rewriting existing OpenClaw functionality
	•	Report progress back to the Product Manager

Step 4 — Completion Flow
	•	FE reports results to PM
	•	PM validates completion
	•	PM reports final result to User

⸻

3️⃣ OpenClaw Integration (MANDATORY)

You must maximize reuse of the OpenClaw package.

Reuse the following components:

Agent Infrastructure
	•	Base Agent classes
	•	Agent lifecycle management
	•	Role configuration

Task & Workflow System
	•	Task objects
	•	Task lifecycle management
	•	Task assignment logic

Orchestration Engine
	•	Message routing
	•	Agent communication handlers
	•	Event-driven triggers

Memory & Context
	•	Shared memory modules
	•	Context propagation
	•	State management

Tool Execution Framework (if available)
	•	Tool registry
	•	Function calling abstraction
	•	Execution validation

Logging & Monitoring
	•	Agent activity logs
	•	Task execution tracing

⸻

4️⃣ Development Constraints
	•	Do NOT modify OpenClaw core package code.
	•	Extend or wrap OpenClaw components if customization is required.
	•	Avoid duplicating existing OpenClaw logic.
	•	Follow OpenClaw’s architectural patterns and conventions.
	•	Document any overrides or extensions clearly.

⸻

5️⃣ Frontend vs Backend Responsibilities

Frontend (Custom)
	•	User interface
	•	Task submission UI
	•	Status tracking UI
	•	Communication display

Backend
	•	OpenClaw integration layer
	•	Agent instantiation (PM, FE)
	•	Task routing
	•	Business logic
	•	API endpoints

⸻

6️⃣ Design Principles
	•	Modular architecture
	•	Clear separation of concerns
	•	Strict agent hierarchy
	•	Scalable structure
	•	Maintainable codebase
	•	Maximum reuse of OpenClaw components

⸻

This system must behave as a structured multi-agent workflow platform where:
	•	The User assigns tasks
	•	The Product Manager plans and delegates
	•	The Frontend Engineer executes
	•	OpenClaw handles orchestration, task lifecycle, memory, and communication
