# Slack access to the KB agent: research notes

Status: **researched, not implemented** (2026-11-05). Based on the Mastra docs
([Slack channel](https://mastra.ai/integrations/channels/slack.md), [Channels overview](https://mastra.ai/docs/channels.md),
[Channels reference](https://mastra.ai/reference/agents/channels.md)) and the installed `@mastra/core` 1.82.0
(`dist/channels/*`, which includes Slack-specific `slack-blocks` and `typing-status` modules).

## Feasibility

Yes, natively. Mastra agents take a `channels` option. Adding the Slack adapter from the Chat SDK makes Mastra:

- register a webhook route `/api/agents/<agent-id>/channels/slack/webhook`;
- run the agent through the normal pipeline for each DM or @-mention;
- stream the reply back into the Slack thread, with Slack AI indicators and interactive cards.

```ts
import { createSlackAdapter } from '@chat-adapter/slack'

new Agent({
  id: 'slack-assistant',
  // ...same model, instructions, Knowledge tools, ingest_source, memory as the Knowledge assistant
  channels: { adapters: { slack: createSlackAdapter() } },
})
```

- Credentials: `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN` (read from the environment automatically).
- npm: `@chat-adapter/slack`. Separately, `@mastra/slack` 1.8.1 ("app factory, OAuth, slash commands") exists for multi-workspace installs. It isn't needed for a single workspace.

## Setup (things only a workspace admin can do)

1. **Create the app.** At api.slack.com/apps, create an app from the manifest in the Mastra Slack doc.
   - Bot scopes: `im:write`, `app_mentions:read`, `channels:history`, `channels:read`, `chat:write`, `users:read`, `im:read`, `im:history`.
   - Events: `app_mention`, `message.channels`, `message.im`.
   - Interactivity on, pointing at the same webhook URL.
2. **Install it.** Install to the workspace and copy the Signing Secret and Bot User OAuth Token into `.env`.
3. **Expose the local server.** Slack can't call `localhost`, so open a tunnel to the dev server: `npx cloudflared tunnel --url http://localhost:4111`.
4. **Point Slack at it.** Set both Event Subscriptions and Interactivity request URLs to `https://<tunnel>/api/agents/<agent-id>/channels/slack/webhook`, then reinstall if Slack asks. The tunnel URL changes on every restart, so update these each time.
5. **Use it.** DM the bot, or `/invite @bot` to a channel and @-mention it. Replies go in the thread.

## Design required for this prototype

### Identity → KB scopes

This is the critical part.

- **No auth on the webhook.** The Slack route is exempt from Mastra server auth; requests are verified only by the Slack signing secret.
- **Anyone who can reach the bot can use it.** There's no built-in user allowlist: everyone in a channel the bot belongs to, or who DMs it, can talk to it. In a Slack Connect channel that includes external members.
- **Our default would leak private notes.** Our scope middleware (`src/scopes.ts`) falls back to `POC_USER` or `alice` when no user header is present. Behind the Slack webhook, every Slack user would therefore read Alice's private `resource:alice` notes. **That fallback must not apply to the Slack agent.**

The plan:

- The sender's Slack identity arrives on the request context under `channel`: `userId`, `userName`, `channelId`, `threadId` and `isDM`.
- Map Slack user IDs to KB users in config, e.g. `SLACK_USERS=U012AB:alice,U034CD:bob`.
- Derive scopes in the Slack agent's `scopes` function (server-side, as for MCP):
  - mapped user → `org:kelvara` + `resource:<user>`;
  - unmapped user → `org:kelvara` only, read-only (or refuse).
- Gate writes (`knowledge_note`, `knowledge_page`, `ingest_source`) on a mapped user, optionally routing them through the review gate (`REVIEW=on`, with the T12b caveat: re-pass the approval policy on resume).

### Memory and threads (to verify with real traffic)

- Agent scopes must agree with Memory's resource and thread: a run fails when a `resource:` scope differs from the Memory resource.
- **Not yet checked:** which resource and thread IDs the Slack channel driver passes to Memory. It might use a Slack thread as the Memory thread and the Slack user as the resource. Confirm this before deriving `resource:<user>` from the Slack mapping. If the driver uses Slack IDs as the resource, map to the KB user in the `scopes` function rather than holding a second `resource:` scope.

### Author attribution

- Tool writes record `agent:<agentId>` as author, regardless of the Slack user.
- Attribute the human the way the Studio assistant does: put the mapped user and date into the instructions, so notes say "per bob, slack 2026-11-05".
- A per-user agent id is not available per call.

## Risks

- **Access:** channel membership is the only built-in access control. Adding the bot to a shared or external channel grants those people the agent's tools and data. Combined with the alpha's "no isolation guarantee", keep private scopes out of reach of unmapped users.
- **Slow ingests and retries:** Slack expects a `200` acknowledgement within 3 s and retries up to 3 times.
  - Mastra acknowledges first and streams the reply.
  - Long tool calls (an `ingest_source` run takes 20–60 s) happen after the acknowledgement.
  - Retries could still double-submit a source if acknowledgement ever fails. The `raw/` hash dedupe catches byte-identical resubmissions, but not re-wrapped text (see FINDINGS gaps).
- **Serverless:** channels may need `waitUntil` and shared pub/sub for background responses and thread leases (see the Channels overview). That doesn't apply to the local dev server.
- **Health data in Slack (Kelvara dataset):** Slack is not an HDS-certified host, so patient data must not end up there.
  - The KB holds no patient data by design, so the bot's answers are safe to post.
  - Users may still paste a complaint ticket that contains patient identifiers into a thread. That text then lives in Slack, and possibly in Mastra Memory, whatever the agent does.
  - Mitigations:
    - a "no patient data" notice in every channel the bot joins;
    - an input filter refuses messages that look like they contain identifiers;
    - Memory is not kept for the Slack agent.

## Estimated work

| Step | Effort |
| --- | --- |
| Slack agent + adapter + identity mapping + write gating | ~½ day |
| Manifest + README section | ~1 h |
| End-to-end test in a real workspace | needs a Slack admin, tokens and a tunnel |
