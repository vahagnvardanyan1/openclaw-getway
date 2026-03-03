import type { FastifyInstance } from 'fastify';
import { listAllTasks, getTaskById, getTaskEvents } from '../db/client.js';

export function registerTaskRoutes(app: FastifyInstance): void {
  app.get<{
    Querystring: { status?: string; assignee?: string; priority?: string };
  }>('/api/tasks', async (request) => {
    const { status, assignee, priority } = request.query;
    const tasks = listAllTasks({ status, assignee, priority });
    return { tasks, count: tasks.length };
  });

  app.get<{
    Params: { id: string };
  }>('/api/tasks/:id', async (request, reply) => {
    const task = getTaskById(request.params.id);
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    const events = getTaskEvents(request.params.id);
    return { task, events };
  });
}
