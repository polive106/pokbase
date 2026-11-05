# pokbase — Mastra Knowledge prototype (read + ingest)

An evaluation prototype that uses [Mastra Knowledge](https://mastra.ai/docs/knowledge/overview)
(`@mastra/core` 1.82.0, **alpha**) as the store for an **agent-maintained Markdown knowledge base**:

- raw sources are dropped into a write-once folder, queued, and ingested by an LLM agent into curated
  concept pages (with citations, contradictions and superseded values);
- employees chat with an assistant that reads and writes the KB, and can create their own **skills**;
- everything runs locally: SQLite by default, no Docker, and **no API key needed** for the core paths.

The results of the evaluation are in [FINDINGS.md](FINDINGS.md); the original brief is [prd.md](prd.md).

> **All data is fictional.** The KB is the internal handbook of *Kelvara Health*, an invented French
> digital-health startup (a class IIa software medical device, MDR vigilance, GDPR, HDS hosting).
> The content is **in French**. It contains no real company, person or patient data.

---

## Contents

1. [Quick start (5 minutes, no API key)](#1-quick-start-5-minutes-no-api-key)
2. [Add a model key (chat, ingestion)](#2-add-a-model-key-chat-ingestion)
3. [Guided tour](#3-guided-tour)
4. [How it works](#4-how-it-works)
5. [The dataset](#5-the-dataset)
6. [Tests and eval](#6-tests-and-eval)
7. [Configuration reference](#7-configuration-reference)
8. [Scripts](#8-scripts)
9. [Project layout](#9-project-layout)
10. [Troubleshooting](#10-troubleshooting)
11. [Limits: this is a prototype](#11-limits-this-is-a-prototype)

---

## 1. Quick start (5 minutes, no API key)

**Prerequisites**

- **Node.js ≥ 22.13** (`node -v`) and npm. macOS or Linux (Windows: use WSL).
- Nothing else. Docker and an LLM key are optional (see below).

```bash
git clone https://github.com/polive106/pokbase.git
cd pokbase
npm ci                                      # ~1 min
cp .env.example .env                        # defaults: SQLite store, mock model
npm run seed -- fixtures/kelvara-handbook   # loads 22 pages into ./data/knowledge-test.db
npm run dev                                 # Studio on http://localhost:4111
```

Open **http://localhost:4111**, then **Knowledge** in the sidebar: you should see the `kelvara` knowledge
base with its page tree (`sites`, `suppliers`, `policies`, `products`, `playbooks`, `reglementation`, …)
and a link graph.

Check it from the terminal too (in another shell):

```bash
npm run kb -- search "bris de glace"                 # keyword search through the real Knowledge tools
npm run kb -- read org:kelvara#people/prrc           # read a page (body, version, notes)
npm test                                             # deterministic test suite, ~1.5 min, no key
```

Without a key, the agents use a **scripted mock model**: it really calls the Knowledge tools, so reads,
writes, the queue, the lease and the review gate all work, but it doesn't *understand* anything.
To chat for real, add a key.

---

## 2. Add a model key (chat, ingestion)

Edit `.env`:

```bash
MODEL=anthropic/claude-sonnet-5-5
ANTHROPIC_API_KEY=sk-ant-...        # never commit this; .env is git-ignored
```

Any provider supported by the Mastra model router works (`openai/...` with `OPENAI_API_KEY`,
`google/...` with `GOOGLE_GENERATIVE_AI_API_KEY`). Restart `npm run dev` after changing `.env`.

Smoke test:

```bash
npm run ask -- "Qui décide de déclarer un incident grave ?"
# → "La PRRC décide …", with page refs such as org:kelvara#playbooks/incident-vigilance
```

Cost: a chat answer is a few thousand tokens; ingesting the 8 sample sources is ~130k tokens;
the full LLM test suite and eval together cost a few dollars.

---

## 3. Guided tour

Everything below assumes `npm run dev` is running and a key is set (except 3.1 and 3.6, which work without).

### 3.1 Browse the knowledge base (no key)

Studio → **Knowledge**: tree, pages, notes and the link graph. Pages are Markdown; links between pages
are Knowledge refs (`org:kelvara#sites/elmhaven-monitoring-centre`). Front matter that Knowledge can't store
natively (type, tags, status, document control fields) lives in a ```` ```metadata ```` block at the top of
each body.

### 3.2 Chat with the KB

Studio → **Agents** → **Knowledge assistant** (read + write, with memory). Try, in French:

- "Qui héberge nos données patients ?" then, in the same thread, "et quel crédit de service nous doivent-ils ?"
- "Combien de temps garde-t-on les enregistrements ECG bruts ?" (current value, and the superseded 2024 one)
- "Quel est le délai de la FDA pour une déclaration MDR ?" → it should say **it doesn't know**: the KB only
  covers EU/French rules, and the agent must not answer regulatory questions from memory.

Answers cite page refs. The **Reader agent** is the same, read-only.

### 3.3 Write to the KB, and check isolation

In the assistant chat:

- "Note pour tout le monde : le poste 4 d'Elmhaven a été remplacé." → a dated note in `org:kelvara`.
- "Garde une note privée pour moi : relancer Ardoise sur le certificat HDS v2." → a note in `resource:alice`.
- "Mets à jour la page Thornfield : elle compte maintenant 10 postes." → a body edit with `expectedVersion`,
  the old value struck through.

Studio always runs as user **alice**. To check that Bob can't see Alice's private note, restart as Bob:

```bash
POC_USER=bob npm run dev
```

Over HTTP, the user comes from the `x-poc-user` header (`alice` | `bob`); scopes are always set server-side:

```bash
curl -s localhost:4111/api/agents/assistant/generate -H 'content-type: application/json' -H 'x-poc-user: bob' \
  -d '{"messages":[{"role":"user","content":"Quand ferme le centre de surveillance d Elmhaven ?"}],"memory":{"thread":"bob-1","resource":"assistant-bob"}}'
```

### 3.4 Create and use skills

Employees create **skills** (reusable instructions) from the chat; they can't create agents.

1. "Crée-moi une compétence privée nommée resume-incident : quand je décris un incident, lis le playbook
   incidents et vigilance et réponds en 3 lignes : Gravité, Délai de déclaration, Qui décide."
2. In a **new** chat: "/resume-incident Un épisode de FA a été manqué, le patient a fait un AVC et il est décédé."
   → the assistant loads the skill, reads the playbook, and answers in 3 cited lines.
3. "Partage la compétence resume-incident" → every employee can use it. "Quelles compétences ai-je ?" lists them.

Skills are stored in Mastra's (open-source, versioned) skills storage; see `src/skills.ts`. A colleague's shared
skill is treated as untrusted content. There is no approval step before sharing yet.

### 3.5 Ingest a new source

Ingestion always goes through the pipeline: content-hashed copy into `raw/` (write-once, deduplicated), a job
in the queue, a per-KB lease, then the ingest agent.

- **From the chat:** paste a document and say "ingère cette source : …". It takes 20–60 s; the assistant
  reports pages created/changed and contradictions recorded.
- **From a form:** Studio → **Workflows** → `ingest-source` → title + full text → Run.
- **From the CLI, with the sample sources** (two contradicting dates, a superseded value, a duplicate, …):

  ```bash
  for f in fixtures/sources/*; do npm run submit -- "$f"; done   # src-05 is reported as "duplicate"
  WORKER_ONCE=1 npm run worker; WORKER_ONCE=1 npm run worker      # batch cap is 5, so two runs
  npm run kb -- read org:kelvara#sites/elmhaven-monitoring-centre # both closure dates + a "Contradictions" section
  npm run export -- out/export                                    # the KB back as Markdown files
  ```

  Run logs (every tool call, `expectedVersion` used or not, tokens) are in `out/ingest-runs/`.

**Human review of writes:** start the worker with `REVIEW=on npm run worker`; each Knowledge write is held.
In another terminal: `npm run review` (list), `npm run review -- approve <id>`, `npm run review -- reject <id> "reason"`.

### 3.6 Use it from Claude Code (MCP, no key for reads/writes)

`.mcp.json` registers an MCP server named **`kelvara-kb`** (stdio, `src/mcp/stdio.ts`). Open the project with
`claude`, approve the server when asked (or via `/mcp`), and ask Claude e.g. "Qui est responsable de la
réglementation chez Kelvara ?".

| Tool | What it does |
| --- | --- |
| `search`, `list`, `read` | search, page tree, read a page (as `POC_USER`, default `alice`) |
| `add_note` | dated note; `private: true` → visible only to that user |
| `create_page`, `edit_page` | create a page; edit a body (requires `expectedVersion`, optional line `range`) |
| `ingest_source` | the full ingestion pipeline (needs a key) |
| `ask_reader` | the reader agent answers end to end (needs a key) |

Without Claude Code: `npm run mcp:smoke` (add `-- --ask "…"` to try `ask_reader`).

### 3.7 CLI cheat sheet

```bash
npm run kb -- list                                        # scopes and page tree
npm run kb -- search "conservation des données"
npm run kb -- read org:kelvara#playbooks/incident-vigilance --section "5. Incidents graves et déclaration de vigilance"
npm run kb -- read resource:bob#notes --user alice        # isolation: "not found"
npm run kb -- note org:kelvara#sites/elmhaven-monitoring-centre "Poste 4 remplacé" --user bob
npm run kb -- create suppliers/test-co "Test Co" ./body.md
npm run kb -- write org:kelvara#suppliers/test-co ./new-body.md --version 1   # stale version → conflict
npm run ask -- "Combien de postes compte Thornfield ?"    # reader agent (mock without a key)
npm run inspect                                           # dump all tables to out/db-dump.json
```

---

## 4. How it works

```
 client / chat / CLI                                  Mastra (src/mastra/index.ts)
 ───────────────────                                  ─────────────────────────────
 submit(file) ──► raw/<sha256>.md (write-once, dedupe)
              └─► SQLite queue: source row + one job per KB   (src/ingest/queue.ts)
                                │
 worker ──► takes the job, acquires the KB lease (holder, epoch, heartbeat)
        └─► ingest agent ── Knowledge tools ──► org:kelvara pages + notes
              (every write is checked against the lease first: "fenced" if it was lost)

 reader / assistant agents ── Knowledge tools ──► org:kelvara + resource:<user>
                              (scopes set server-side by src/scopes.ts, never by the model or the request body)
```

- **Store:** Mastra Knowledge on LibSQL (`./data/knowledge-test.db`) or Postgres (`STORE=pg`).
- **Scopes:** `org:kelvara` (shared, role *editor*: agents can't delete pages) and `resource:alice` /
  `resource:bob` (private). The user comes from `x-poc-user`, `POC_USER`, or defaults to `alice`.
- **Concurrency:** one ingest at a time per KB (queue + lease), writes fenced by lease epoch, and
  `expectedVersion` on every page edit. FINDINGS explains why each layer is needed.
- **Agents:** `reader` (read-only), `assistant` (read/write, memory, skills, `ingest_source`), and the ingest
  agent (used only by the worker; not exposed on the server).

---

## 5. The dataset

`fixtures/kelvara-handbook/` — 22 pages, in French (page keys stay as ASCII slugs). Controlled documents carry
`doc_id`, `revision`, `owner`, `review_due` and `regulatory_refs` in their front matter.

| Pages | Content |
| --- | --- |
| `products/kelvara-rhythm`, `products/kelvara-suivi` | The class IIa AF-detection software; the patient app (*hors dispositif médical*) |
| `sites/*` | Elmhaven monitoring centre, Thornfield backup centre |
| `suppliers/*` | Ardoise Cloud (HDS host, subprocessor), Linnet Medical (patch maker) |
| `policies/*` | Data retention (+ the deprecated 2024 version), patient-data access |
| `playbooks/incident-vigilance` | MDR vigilance (2/10/15 days), GDPR breaches (72 h), FSCA — the long page (~2,200 words) |
| `people/prrc`, `glossary/significant-change` | The MDR Art. 15 role; a draft definition |
| `reglementation/*` (10 pages) | The real French/EU framework summarised from official sources (ANS, HAS, ANSM, CNIL, EUR-Lex), with a `verified` date: MDR/EUDAMED, matériovigilance, HDS v2, télésurveillance/LATM, PECAN, Ségur, INS, CNIL, EHDS |

`fixtures/sources/` — 8 raw sources, each with an expected effect (a new subprocessor page; two contradicting
closure dates kept side by side; 30 → 45 days marked superseded; a byte-identical duplicate; extra access rules;
a French product note; a canary for the deletion test). `fixtures/adversarial/` — a prompt injection and a
complaint ticket with (fictional) patient identifiers that must never reach the KB.

The regulatory pages summarise real texts for a fictional company: check the official sources before relying
on them for anything real.

---

## 6. Tests and eval

```bash
npm test             # deterministic suite (no key), ~1.5 min; results in out/results/*.json
npm run test:llm     # + the LLM tests (needs a key; a few minutes)
npm run test:pg      # the suite on Postgres (embedded PGlite, no Docker) + parity report
npm run typecheck
```

| Test | Checks | Needs a key |
| --- | --- | --- |
| T1, T2 | Markdown round trip; deterministic seed/export | no |
| T3 | concurrent page writes with/without `expectedVersion` | no |
| T4 | scope isolation (Alice can't see Bob's pages) | no |
| T5–T8 | submit + dedupe, job batching, one ingest per KB (2 workers, 60 s), lease fencing (SIGSTOP) | no |
| T12, T12b | review gate (hold, approve, reject) | no |
| T13, T15, T16 | deletion leftovers, migration safety, Postgres parity | no |
| T9–T11, T14, T14b | ingest correctness, write discipline, concurrent agents, prompt injection, patient-data minimisation | **yes** (BLOCKED otherwise) |

Real Postgres instead of PGlite: `docker compose up -d`, then
`STORE=pg PG_URL=postgres://poc:poc@localhost:55433/poc npm test`.

**Retrieval eval** (36 questions in `eval/questions.json`; recall@5 without a key, plus reader answers with one):

```bash
npm run eval -- --label seed        # on the freshly seeded KB
# ingest the sample sources (section 3.5), then:
npm run eval -- --label ingested
```

Results go to `out/eval-results.json` and the tables between the `eval` markers in FINDINGS.md.

---

## 7. Configuration reference

All optional; set them in `.env` or on the command line.

| Variable | Default | Meaning |
| --- | --- | --- |
| `MODEL` | mock (or a default for the key found) | Mastra model-router id, e.g. `anthropic/claude-sonnet-5-5`; `mock` forces the scripted model |
| `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` | – | provider keys |
| `STORE` | `libsql` | `libsql` (./data) or `pg` |
| `PG_URL` | – | real Postgres for `STORE=pg`; without it, PGlite is used |
| `REVIEW` | `off` | `on` holds every Knowledge write of the worker for `npm run review` |
| `POC_USER` | `alice` | user for Studio, the CLI default and the MCP server (`alice` or `bob`) |
| `BATCH_CAP` | `5` | max sources per ingest run |
| `LEASE_TTL_MS` | `30000` | KB lease duration (renewed by heartbeat) |
| `WORKER_ONCE` | – | `1`: the worker processes one batch and exits |
| `DATA_DIR`, `RAW_DIR`, `OUT_DIR`, `KB_DB`, `QUEUE_DB` | `./data`, `./raw`, `./out`, … | where things are written (all git-ignored) |

---

## 8. Scripts

| Script | What it does |
| --- | --- |
| `dev` | Mastra dev server + Studio on :4111 (Knowledge routes, scope middleware) |
| `seed -- <dir>` | load a Markdown bundle into Knowledge (idempotent); writes `out/seed-report.json` |
| `export -- <dir>` | Knowledge → Markdown files (deterministic), with an `index.md` per folder |
| `submit -- <file>` | add a source to `raw/` and queue the KB job |
| `watch` | submit every file dropped into `drop/` (or `drop/alice/`, `drop/bob/`) |
| `worker` | the lease-holding ingest worker (Ctrl-C to stop) |
| `review` | list / approve / reject held writes (`REVIEW=on`) |
| `kb`, `ask` | CLI over the Knowledge tools; ask the reader agent |
| `mcp`, `mcp:smoke` | the MCP server (stdio); a smoke test client |
| `inspect` | dump knowledge and queue tables to `out/db-dump.json` |
| `test`, `test:llm`, `test:pg`, `parity`, `typecheck` | tests (section 6) |
| `eval -- --label <name>` | retrieval eval |
| `reset` | delete `./data`, `./out` and `./raw` (asks first; `-- --yes` to skip) |

---

## 9. Project layout

```
src/mastra/index.ts    Mastra instance: storage, Knowledge, reader + assistant agents, ingest workflow, routes
src/agents.ts          agent definitions and instructions, tool instrumentation (lease fencing hook)
src/knowledge.ts       the Knowledge instance and its scopes          src/scopes.ts  server-side user → scopes
src/skills.ts          employee skills: chat tools + per-user resolver
src/ingest/            submit, SQLite queue, worker (lease, fencing, review gate), watch, UI tool/workflow,
                       instructions.md (the ingest agent's rules)
src/mcp/               MCP server (stdio) and smoke client         src/cli.ts     the `kb` CLI
src/seed.ts, export.ts Markdown ⇄ Knowledge                          src/lib/       Markdown mapping, mock model, tool runner
tests/                 vitest T1–T16 (results → out/results/)       eval/          questions + runner
fixtures/              seed KB, sample sources, adversarial sources
docs/slack.md          research: exposing the assistant in Slack (not built)
FINDINGS.md            what we learned;  prd.md  the original brief
```

---

## 10. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Studio says "another development server is running" / port 4111 busy | stop the other `npm run dev` (`lsof -nP -iTCP:4111`), then start again |
| Studio shows old pages after a reseed | restart `npm run dev` (it keeps the database open) |
| Want a clean slate | `npm run reset -- --yes && npm run seed -- fixtures/kelvara-handbook` |
| Answers look like "(mock reader — keyword hits only)" | no key or `MODEL=mock`: set `MODEL` and a provider key in `.env`, restart |
| "You have reached your specified API usage limits" | your provider's spend limit; raise it in the provider console |
| `kelvara-kb` doesn't appear in Claude Code | open Claude Code from the project folder, approve the server in `/mcp`, restart Claude Code |
| LLM tests recorded as BLOCKED | run `npm run test:llm` (plain `npm test` never calls a model) |
| `T7`/`T8` flaky on a very busy machine | they spawn worker processes with short leases; rerun on an idle machine |

---

## 11. Limits: this is a prototype

- **No real authentication.** Users are `alice` / `bob`, chosen by a header or `POC_USER`. Don't expose the
  server beyond your laptop. A real deployment needs SSO in front and server-side scopes per user.
- **Mastra Knowledge is alpha:** no revision history, no exact-revision citations, isolation only guaranteed
  on the tool path. See FINDINGS "Gaps" and "Risks".
- **Never put real patient data in it.** `raw/` is write-once by design, so a source can't be erased.
- Exposing the assistant in Slack is researched in [docs/slack.md](docs/slack.md), not built.
