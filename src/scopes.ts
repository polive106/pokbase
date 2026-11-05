import { MASTRA_RESOURCE_ID_KEY, MASTRA_SCOPES_KEY } from '@mastra/core/request-context';
import { config } from './config.js';

/**
 * Server-side run scopes. The "authenticated user" is simulated by the `x-poc-user` header
 * (alice | bob), defaulting to alice for local Studio use. Scopes are derived here only; the
 * model and request bodies never supply them (@mastra/server reserves agent scopes, so a body's
 * `scopes` is refused).
 */
export type User = (typeof config.users)[number];
export const isUser = (u: unknown): u is User => (config.users as readonly unknown[]).includes(u);

export function scopesForUser(user: string): string[] {
  if (!isUser(user)) throw new Error(`unknown user ${user}`);
  return [config.orgScope, `resource:${user}`];
}

export const scopeMiddleware = {
  path: '/api/*',
  handler: async (c: any, next: () => Promise<void>) => {
    const user = c.req.header('x-poc-user') ?? process.env.POC_USER ?? 'alice'; // Studio can't send headers: POC_USER=bob npm run dev
    if (!isUser(user)) return c.json({ error: 'unknown user' }, 401);
    const requestContext = c.get('requestContext');
    requestContext?.set(MASTRA_SCOPES_KEY, scopesForUser(user));
    requestContext?.set(MASTRA_RESOURCE_ID_KEY, user);
    await next();
  },
};
