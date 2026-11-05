import { MASTRA_RESOURCE_ID_KEY } from '@mastra/core/request-context';
import { createSkill } from '@mastra/core/skills';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { isUser } from './scopes.js';

/**
 * Employee skills, without Agent Builder.
 *
 * Skills live in Mastra's open-source skills storage (`storage.getStore('skills')`, versioned). Employees
 * create them from the chat with `skill_create`; the chat agent's `skills` resolver loads, per request,
 * the user's own skills plus the shared ones, so they can be used (or invoked by name) in any chat.
 * The author always comes from the server-side user (scope middleware), never from the model.
 */
const userOf = (requestContext: any): string | undefined => {
  const u = requestContext?.get?.(MASTRA_RESOURCE_ID_KEY);
  return isUser(u) ? u : undefined;
};
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function skillsStore(storage: any) {
  const store = await storage.getStore('skills');
  if (!store) throw new Error('this storage has no skills domain');
  return store;
}

/** The user's own skills plus the shared (public) ones, latest version, deduplicated by id. */
export async function listSkillsFor(storage: any, user?: string) {
  const store = await skillsStore(storage);
  const resolved = async (args: any) => ((await store.listResolved({ perPage: false, status: 'draft', ...args })) as any).skills ?? [];
  const [own, shared] = await Promise.all([user ? resolved({ authorId: user }) : [], resolved({ visibility: 'public' })]);
  const byId = new Map<string, any>();
  // Only usable skills: not archived, valid name, non-empty description and instructions (drafts left half-written are skipped).
  for (const s of [...own, ...shared]) if (s.status !== 'archived' && SLUG.test(s.name ?? '') && s.description?.trim() && s.instructions?.trim()) byId.set(s.id, s);
  return [...byId.values()];
}

/** `skills` option for the chat agent: resolved per request from the server-side user. */
export function userSkillsResolver(storage: any) {
  return async ({ requestContext }: any) => {
    const skills = await listSkillsFor(storage, userOf(requestContext)).catch(() => []);
    // Skip records that are not valid skills (e.g. half-written drafts) instead of failing the whole chat.
    return skills.flatMap((s) => {
      try {
        return [createSkill({ name: s.name, description: s.description, instructions: s.instructions, metadata: { authorId: s.authorId, visibility: s.visibility, id: s.id } })];
      } catch {
        return [];
      }
    });
  };
}

export function createSkillTools(storage: any) {
  return {
    skill_create: createTool({
      id: 'skill_create',
      description:
        "Create (or replace) one of the user's skills: reusable instructions the assistant follows when the skill applies or when the user invokes it by name. Private by default; shared=true makes it available to every employee. Never put patient-identifying data in a skill.",
      inputSchema: z.object({
        name: z.string().regex(SLUG).max(64).describe('kebab-case, e.g. "triage-reclamation"'),
        description: z.string().min(1).max(1024).describe('What the skill does and when to use it'),
        instructions: z.string().min(1).describe('The skill body (Markdown): steps, rules, KB pages to read, output format'),
        shared: z.boolean().optional(),
      }),
      execute: async (input: any, ctx: any) => {
        const user = userOf(ctx?.requestContext);
        if (!user) throw new Error('no authenticated user: skills need a known author');
        const store = await skillsStore(storage);
        const id = `${user}--${input.name}`;
        const visibility = input.shared ? 'public' : 'private';
        const existing = await store.getById(id);
        const snapshot = { name: input.name, description: input.description, instructions: input.instructions };
        if (existing) {
          if (existing.authorId !== user) throw new Error('you can only change your own skills');
          await store.update({ id, visibility, ...snapshot });
        } else {
          await store.create({ skill: { id, authorId: user, visibility, ...snapshot } });
        }
        return { id, name: input.name, visibility, created: !existing, note: 'Available in your next message.' };
      },
    }),
    skill_list: createTool({
      id: 'skill_list',
      description: "List the skills available to this user: their own (private or shared) and those shared by colleagues.",
      inputSchema: z.object({}),
      execute: async (_input: any, ctx: any) => {
        const user = userOf(ctx?.requestContext);
        const skills = await listSkillsFor(storage, user);
        return { skills: skills.map((s) => ({ name: s.name, description: s.description, author: s.authorId, shared: s.visibility === 'public', mine: s.authorId === user })) };
      },
    }),
    skill_delete: createTool({
      id: 'skill_delete',
      description: "Delete one of the user's own skills by name.",
      inputSchema: z.object({ name: z.string().regex(SLUG) }),
      execute: async (input: any, ctx: any) => {
        const user = userOf(ctx?.requestContext);
        if (!user) throw new Error('no authenticated user');
        const store = await skillsStore(storage);
        const id = `${user}--${input.name}`;
        const existing = await store.getById(id);
        if (!existing || existing.authorId !== user) throw new Error(`no skill "${input.name}" of yours`);
        await store.delete(id);
        return { deleted: input.name };
      },
    }),
  };
}
