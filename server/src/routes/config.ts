import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve(process.cwd(), '..', 'openclaw.json');

export function registerConfigRoutes(app: FastifyInstance): void {
  // GET current configuration
  app.get('/api/config', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const configData = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      return configData;
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to read config file', details: (err as Error).message });
    }
  });

  // POST update agent configuration
  app.post<{
    Body: { agentId: string; name?: string; description?: string; tools?: string[] };
  }>('/api/config/agents', async (request: FastifyRequest<{
    Body: { agentId: string; name?: string; description?: string; tools?: string[] };
  }>, reply: FastifyReply) => {
    const { agentId, name, description, tools } = request.body;

    if (!agentId) {
      return reply.code(400).send({ error: 'agentId is required' });
    }

    try {
      const configData = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      
      if (!configData.agents) configData.agents = {};
      
      if (!configData.agents[agentId]) {
        configData.agents[agentId] = {
          name: name || agentId,
          description: description || '',
          workspace: `./workspaces/${agentId}`,
          tools: { allow: tools || [] },
          agentComm: { canMessageAgents: [], canReceiveFrom: [] }
        };
      } else {
        if (name) configData.agents[agentId].name = name;
        if (description) configData.agents[agentId].description = description;
        if (tools) configData.agents[agentId].tools.allow = tools;
      }

      writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2) + '\n');
      return { success: true, agent: configData.agents[agentId] };
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to update config file', details: (err as Error).message });
    }
  });

  // POST add skill (tool) to an agent
  app.post<{
    Params: { id: string };
    Body: { skill: string };
  }>('/api/config/agents/:id/skills', async (request: FastifyRequest<{
    Params: { id: string };
    Body: { skill: string };
  }>, reply: FastifyReply) => {
    const agentId = request.params.id;
    const { skill } = request.body;

    if (!skill) {
      return reply.code(400).send({ error: 'skill name is required' });
    }

    try {
      const configData = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      
      if (!configData.agents || !configData.agents[agentId]) {
        return reply.code(404).send({ error: `Agent ${agentId} not found` });
      }

      if (!configData.agents[agentId].tools) {
        configData.agents[agentId].tools = { allow: [] };
      }

      if (!configData.agents[agentId].tools.allow.includes(skill)) {
        configData.agents[agentId].tools.allow.push(skill);
      }

      writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2) + '\n');
      return { success: true, tools: configData.agents[agentId].tools.allow };
    } catch (err) {
      return reply.code(500).send({ error: 'Failed to update config file', details: (err as Error).message });
    }
  });
}
