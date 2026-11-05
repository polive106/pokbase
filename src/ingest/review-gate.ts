import type { Queue } from './queue.js';

/**
 * REVIEW=on: the ingest agent runs with Mastra's `requireToolApproval` for write tools. When a run
 * suspends on a write, the worker records the pending call here and waits; `npm run review`
 * approves or rejects it; the worker then resumes with `approveToolCallGenerate` /
 * `declineToolCallGenerate`. The pending_review table is part of the queue schema (queue.ts).
 */

export async function requestReview(queue: Queue, item: { runId: string; agentRunId: string; toolCallId?: string; tool: string; args: unknown }) {
  const r = await queue.run(`INSERT INTO pending_review (run_id, agent_run_id, tool_call_id, tool, args, created_at) VALUES (?,?,?,?,?,?)`, [
    item.runId, item.agentRunId, item.toolCallId ?? null, item.tool, JSON.stringify(item.args), Date.now(),
  ]);
  return Number(r.lastInsertRowid);
}

export async function waitForDecision(queue: Queue, id: number, opts: { pollMs?: number; signal?: AbortSignal } = {}) {
  for (;;) {
    const r = await queue.run(`SELECT decision, reason FROM pending_review WHERE id = ?`, [id]);
    const row = r.rows[0];
    if (row?.decision) return { decision: String(row.decision) as 'approved' | 'rejected', reason: row.reason ? String(row.reason) : undefined };
    if (opts.signal?.aborted) throw new Error('aborted while waiting for review');
    await new Promise((res) => setTimeout(res, opts.pollMs ?? 500));
  }
}

export async function decide(queue: Queue, id: number, decision: 'approved' | 'rejected', reason?: string) {
  const r = await queue.run(`UPDATE pending_review SET decision = ?, reason = ?, decided_at = ? WHERE id = ? AND decision IS NULL`, [
    decision, reason ?? null, Date.now(), id,
  ]);
  return r.rowsAffected === 1;
}

export async function listPending(queue: Queue) {
  return queue.all<{ id: number; run_id: string; tool: string; args: string; created_at: number }>(
    `SELECT id, run_id, tool, args, created_at FROM pending_review WHERE decision IS NULL ORDER BY id`,
  );
}
