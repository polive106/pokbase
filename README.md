# Mastra Knowledge prototype (read + ingest)

Evaluation prototype: Mastra Knowledge (`@mastra/core` 1.82.0, alpha) as the store for an
agent-maintained Markdown knowledge base, with a queued, lease-fenced ingestion pipeline.
Results are in [FINDINGS.md](FINDINGS.md).

All data is fictional. The seed is the handbook of **Kelvara Health**, an invented EU digital-health
startup working under heavy regulation. It contains no real company, person or patient data.

## The dataset

`fixtures/kelvara-handbook/` holds 22 concept pages, **all written in French** (page keys stay as ASCII slugs, e.g. `sites/elmhaven-monitoring-centre`). The sources, adversarial fixtures and eval questions are in French too. Each controlled document carries `doc_id`, `revision`,
`owner`, `review_due` and `regulatory_refs` front matter.

| Page | What it covers |
| --- | --- |
| `products/kelvara-rhythm` | Class IIa software medical device (MDR rule 11, IEC 62304 class B) that flags suspected AF in patch ECGs |
| `products/kelvara-suivi` | The patient companion app, *hors dispositif médical* |
| `sites/elmhaven-monitoring-centre`, `sites/thornfield-backup-centre` | Remote ECG review centres |
| `suppliers/ardoise-cloud`, `suppliers/linnet-medical` | HDS-certified host and subprocessor; patch maker and critical supplier |
| `policies/data-retention` (+ deprecated `-2024`), `policies/patient-data-access` | Retention periods, break-glass access, access logging |
| `playbooks/incident-vigilance` | MDR vigilance (2/10/15-day reports), GDPR breaches (72 h), FSCA. **The long page** (~2,000 words) |
| `people/prrc` | The MDR Article 15 role (a role, not a person) |
| `glossary/significant-change` | Draft definition of a change that needs notified body review |
| `reglementation/*` (10 pages, **in French**) | The real French and EU framework, summarised from official sources (ANS, HAS, ANSM, CNIL, EUR-Lex) and applied to Kelvara: regulatory map, MDR transition and EUDAMED, ANSM matériovigilance, HDS v2 certification, télésurveillance and LATM, PECAN, Ségur du numérique, INS, CNIL health référentiels, EHDS (draft). Each page has a `verified` date and the official URLs in `sources` |

The eight sources in `fixtures/sources/` produce the PRD §6.2 effects in this domain:

- a new messaging subprocessor;
- two conflicting dates for when Elmhaven closes;
- a retention period changed from 30 to 45 days, superseding the old one;
- a byte-identical duplicate;
- extra access-control rules;
- a French product note;
- a canary.

`fixtures/adversarial/` adds two sources:

- `src-09`: a prompt injection;
- `src-10`: a complaint ticket that contains (fictional) patient identifiers, which the ingest agent must not copy into the KB (test T14b).

The agents' instructions add regulated-domain rules:

- no patient data in pages or notes;
- regulatory values are copied from sources, never "corrected" from memory;
- regulatory questions are answered from the KB only (otherwise "I don't know").

**No Docker and no API key are needed** for the deterministic path. Without a key, agents use a
scripted mock model that really calls the Knowledge tools (search/read/write), so the read and write
paths, queue, lease and review gate can all be exercised. Ingestion *quality* needs a real model.

## Quick start

```bash
npm install
npm run seed -- fixtures/kelvara-handbook        # 12 pages into org:kelvara (./data/knowledge-test.db)
npm test                                          # deterministic tests, ~80 s (T7 runs 60 s)
npm run dev                                       # Studio → http://localhost:4111 → Knowledge
```

## Chat with the KB (Studio)

With a key in `.env` (see below), run `npm run dev` and open http://localhost:4111. Go to **Agents**, then **Knowledge assistant**:

- Ask questions, e.g. "Who hosts our patient data?", then follow up in the same thread ("what service credit do they owe if they miss the SLA?").
  Answers cite page refs; threads are kept by Memory.
- Ask it to record things:
  - "Record for everyone: …" adds a dated note in `org:kelvara`.
  - "Save a private note for me: …" adds a note visible only in `resource:<you>`.
  - "Update the Thornfield page: it now has 10 review stations" edits the body with `expectedVersion`, keeping the old value struck through.
- Then open **Knowledge** in Studio to see the pages, notes and graph update.
- **Reader agent** is the same, read-only.
- Studio chats run as `alice`. Use `POC_USER=bob npm run dev` to chat as Bob and check that Alice's private notes are invisible to him.
- Over HTTP, pick the user with the `x-poc-user` header:
  ```bash
  curl -s localhost:4111/api/agents/assistant/generate -H 'content-type: application/json' -H 'x-poc-user: bob' \
    -d '{"messages":[{"role":"user","content":"When does the Elmhaven monitoring centre close?"}],"memory":{"thread":"bob-1","resource":"assistant"}}'
  ```

## Skills (created from the chat)

Employees create their own skills in the **Knowledge assistant** chat; no agent creation, no admin panel:

- "Crée-moi une compétence privée nommée resume-incident : …" → `skill_create` stores it (author = the server-side user).
- In any later chat, the assistant uses it when relevant, or on request: `/resume-incident <incident>`.
- "Partage la compétence resume-incident" makes it visible to every employee; "Quelles compétences ai-je ?" lists
  mine + shared ones; `skill_delete` removes one of mine. Nobody can change someone else's skill.

How it works (`src/skills.ts`): skills live in Mastra's open-source, versioned skills storage
(`storage.getStore('skills')`, also readable at `/api/stored/skills`). The assistant's `skills` resolver loads, per request,
the user's own skills plus the shared ones. Invalid drafts are skipped. Agent Builder (Studio `/agent-builder`) is
**not** used: it always offers agent creation and is an Enterprise feature.

## Ingest a source from the UI

Two ways, both through the real pipeline: `raw/` write-once, dedupe by hash, queue, KB lease, then the ingest
agent with citations, contradictions and superseded values:

- **Chat:** in Agents → Knowledge assistant, paste a document and say "please ingest this source: …". The
  assistant calls `ingest_source`; the nested ingest run takes ~20–60 s, then it reports pages changed and notes added.
- **Workflow form:** Workflows → `ingest-source` → fill *title* and *full source text* → Run.

The submitter is the server-side user (`alice`, or `POC_USER`). Identical text returns `duplicate`. If a
`npm run worker` currently holds the KB lease, the source is queued and that worker ingests it.

## MCP server

`src/mcp/stdio.ts` serves the KB over MCP (stdio). It's registered for Claude Code in `.mcp.json` as
`kelvara-kb`; approve it with `/mcp` or when `claude` starts.

| Tool | What it does |
| --- | --- |
| `search`, `list`, `read` | Knowledge search / tree / page read (as `POC_USER`, default `alice`) |
| `add_note` | dated note on a page; `private: true` → only visible to that user |
| `create_page`, `edit_page` | create a page; edit a body with `expectedVersion` (optional line `range`) |
| `ingest_source` | full pipeline: raw/ → dedupe → queue → lease → ingest agent |
| `ask_reader` | the reader agent answers a question with citations |

Knowledge's own tools refuse scopes that the agent runtime didn't set, so the MCP tools run them
through an agent with server-side scopes. The MCP client can't choose the user; change `POC_USER`
in `.mcp.json` to act as Bob.

Check it without Claude Code: `npm run mcp:smoke -- --ask "When does the Elmhaven monitoring centre close?"`.

## Slack (researched, not built)

The assistant can be exposed in Slack through Mastra's channel adapters. See [docs/slack.md](docs/slack.md) for
the setup, the identity-to-scope design it needs, and the risks.

## Try it: read

```bash
npm run kb -- search "elmhaven closure"
npm run kb -- list
npm run kb -- read org:kelvara#sites/elmhaven-monitoring-centre
npm run kb -- read org:kelvara#playbooks/incident-vigilance --section "5. Incidents graves et déclaration de vigilance"
npm run kb -- read resource:bob#notes --user alice   # isolation: "not found"
npm run ask -- "How long are raw ECG recordings kept?"   # reader agent (LLM if a key is set, else mock)
```

In Studio, open **Knowledge** to browse the tree/graph, and **Agents → Reader agent** to chat. The
server derives run scopes from the `x-poc-user` header (`alice` | `bob`, default `alice`); request
bodies can't set scopes.

## Try it: write

Manual writes (through the real `knowledge_page` / `knowledge_note` tools, as a user):

```bash
npm run kb -- note org:kelvara#sites/elmhaven-monitoring-centre "Station 4 screen replaced (Nov 2026)" --user bob
npm run kb -- create suppliers/test-co "Test Co" ./some-body.md
npm run kb -- read org:kelvara#suppliers/test-co          # note the version vN
npm run kb -- write org:kelvara#suppliers/test-co ./new-body.md --version N   # stale N → version conflict
```

Ingestion pipeline (queue → worker → ingest agent):

```bash
for f in fixtures/sources/*; do npm run submit -- "$f"; done   # src-05 reports "duplicate"
npm run worker              # Ctrl-C to stop; WORKER_ONCE=1 for one batch; run two to see the lease
npm run export -- out/export
npm run inspect             # dumps knowledge + queue tables to out/db-dump.json
```

`npm run watch` submits anything dropped into `drop/` (or `drop/alice/`, `drop/bob/`).

Review gate: `REVIEW=on npm run worker`, then in another terminal `npm run review`,
`npm run review -- approve <id>` or `npm run review -- reject <id> "reason"`.

## With a real model

```bash
cp .env.example .env    # set MODEL=anthropic/claude-sonnet-5-5 and ANTHROPIC_API_KEY=… (or another provider)
npm run reset -- --yes && npm run seed -- fixtures/kelvara-handbook
npm run eval -- --label seed
for f in fixtures/sources/*; do npm run submit -- "$f"; done; WORKER_ONCE=1 npm run worker; WORKER_ONCE=1 npm run worker
npm run export -- out/export && npm run eval -- --label ingested
npm run test:llm        # T9, T10, T11, T14, T14b (otherwise recorded as BLOCKED)
```

## Postgres

`npm run test:pg` runs the suite with `STORE=pg` on **PGlite** (embedded Postgres, served on
127.0.0.1:55432 by the test process via `pglite-socket`), then writes the T16 parity report. For a
real Postgres: `docker compose up -d`, then
`STORE=pg PG_URL=postgres://poc:poc@localhost:55433/poc npm test` (results in `out/results/pg-docker/`;
`PARITY_PG_DIR=pg-docker npm run parity` compares them with LibSQL).
The ingest queue always lives in SQLite (`data/queue.db`); see FINDINGS "Spec vs reality".

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Mastra dev server + Studio (Knowledge routes enabled) |
| `seed -- <dir>` | Markdown bundle → Knowledge via `upsertPage` (idempotent), writes `out/seed-report.json` |
| `export -- <dir>` | Knowledge → Markdown (deterministic), `index.md` per folder |
| `submit -- <file>` | content-addressed copy into `raw/` + source row + KB job, one transaction |
| `watch` | submits files dropped into `drop/` |
| `worker` | lease-holding ingest worker (`WORKER_ONCE=1`, `LEASE_TTL_MS`, `BATCH_CAP`) |
| `review` | list / approve / reject held writes (`REVIEW=on`) |
| `kb`, `ask` | CLI read/write through the Knowledge tools; reader agent |
| `inspect` | dumps tables to `out/db-dump.json` |
| `test` / `test:llm` / `test:pg` | deterministic / + LLM tests / on Postgres (+ parity) |
| `eval -- --label <name>` | retrieval eval (recall@5), plus reader answers when a model is set |
| `reset` | deletes `./data`, `./out`, `./raw` after confirmation |

## Layout

```
src/mastra/index.ts   Mastra instance: storage, Knowledge, readerAgent, ingestAgent, KNOWLEDGE_ROUTES, scope middleware
src/config.ts         STORE=libsql|pg, paths, model selection
src/scopes.ts         server-side scopes (org:kelvara + resource:<user>)
src/knowledge.ts      Knowledge + scope declarations      src/agents.ts   agents + tool instrumentation
src/seed.ts / export.ts / inspect.ts                      src/lib/        markdown mapping, mock model, tool runner
src/ingest/           submit, queue (SQLite), worker (lease + fencing), watch, review gate, instructions.md
tests/                vitest T1–T16 → out/results/*.json  eval/  questions.json, run-eval.ts
fixtures/             seed KB (kelvara-handbook), 8 raw sources, 2 adversarial sources (injection, patient data)
```
