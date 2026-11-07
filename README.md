# Climate Action School 🌿

An educational browser game by **Harmony Digital Consults Ltd** — *"Better technology. Clearer futures."*

You are the **Environment Prefect of Greenfield Model School**, a virtual Nigerian school.
Play one school year (12 turns), make climate decisions, answer quizzes with Auntie Green,
and finish with a **School Green Report Card** — plus real actions for your actual school.

## What is built

- **Frontend:** React + Vite, mobile-first, single-page app (`client/`)
- **Backend:** lightweight Node.js/Express server that is the **only** caller of the
  Anthropic Claude API (`server/index.js` + `api/_lib.cjs`). The browser never calls
  Claude directly and never sees the API key.
- **Vercel-ready:** `vercel.json` builds the client to `client/dist` and runs
  `api/*.js` as serverless functions.
- **Fully playable offline:** if Claude is unreachable, slow, rate-limited, or no key
  is configured, the game falls back to the built-in storybook and question bank —
  no error, no dead end.
- **Progress is saved on the device** at the start of each month; after a refresh
  the start screen offers *Continue my school year*.

## Game loop

1. **Onboarding** — pick an age band (8–11 / 12–14 / 15–17). The age band is sent
   with every Claude call so language and difficulty scale. Choose Solo or Class Mode.
2. **Dashboard** — 5 animated meters: Eco Score, Budget (starts at ₦500,000;
   meter 100 = ₦500,000), Health & Safety, Student Morale, School Reputation.
   Month indicator, scenario card, decision buttons. Tap the **💡** button beside any
   option for a short Auntie Green hint that never reveals the outcome (tapping the
   option itself chooses it). Options that cost money show their price, and options
   the school cannot afford are disabled.
   **Running costs of ₦25,000** are taken from the budget every month. If the budget
   reaches zero, small repairs are delayed (Health −4, Morale −4).
3. **Scenarios** — 12 turns: 10 drawn at random from a pool of **32 Nigerian scenarios**
   (generator fuel, plastic-blocked drainage, dusty fields, leaking boreholes,
   harmattan, Lagos-style flooding, solar vs kerosene, school farms and more), plus
   **2 budget-crunch scenarios** (from 4) with genuine trade-offs: a PTA levy
   shortfall, a generator breakdown, a sponsor with strings attached, roof repair
   vs solar savings.
4. **Auntie Green narration** — after each decision, a warm, locally relevant
   explanation (max 80 words) of the real-world science, ending with one
   constructive tip. Light Pidgin flavour is allowed; content is age-appropriate
   only — no political, religious, violent or medical content.
5. **Quizzes every 3rd month** — timed (5 minutes) quiz of 10 multiple-choice
   questions, 4 options, one-sentence explanations, topic tags
   (climate, waste, energy, water, sanitation, agriculture, disaster risk),
   aligned to NERDC Basic Science & Technology / SSS Geography themes.
   **Adaptive difficulty, tracked per topic:** 3 correct in a row → harder;
   2 wrong in a row → easier.
6. **Report Card** — Green Hero Level (Bronze → Silver → Gold → **Platinum Eco
   Champion**, with Green Sprout below Bronze), based on a **Green Score**: 40% Eco
   plus 15% each for Budget, Health & Safety, Morale and Reputation. Letting any meter
   fall below 20 drops the level one step. Confetti on Gold+, and 3–5 real
   actions tailored to your weakest meters and topics, for your actual school.
7. **Replayability** — a fresh random set of 12 scenarios each play-through.

## Setup

```bash
# 1. Install
npm install
npm --prefix client install

# 2. (Optional, for AI narration/quizzes) copy .env.example to .env and add your key
cp .env.example .env
# Edit .env: ANTHROPIC_API_KEY=sk-ant-...
# The game works without a key — it uses the fallback storybook.

# 3a. Run everything locally (API on :3001, serves the built client)
npm run build
npm start
# Open http://localhost:3001

# 3b. Or run the Vite dev server (proxies /api to :3001)
npm run dev:server   # terminal 1
npm run dev:client   # terminal 2 — http://localhost:5173
```

### Self-tests (no key needed)

```bash
npm test
# Fallback self-test PASSED: scenarios=36 narrations=36 questions=60
# API self-test PASSED
```

`test:fallback` checks the content (every scenario has a narration and at least
one free option, each year has 2 crunch scenarios, quiz shape). `test:api` checks
Class Mode, server-side scenario lookup, rate limits and the safety filter.
GitHub Actions runs both plus the client build on every push and pull request.

## API endpoints (server only)

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/health` | GET | — | `{ ok, aiConfigured, mode, classStorage: "shared" \| "memory" }` (never reveals key validity) |
| `/api/narrate` | POST | `scenarioId, optionIndex, ageBand` | `{ text, tip, source: "ai" \| "fallback" }` |
| `/api/quiz` | POST | `ageBand, topics[]` | `{ questions: [...10], source }` |
| `/api/hint` | POST | `scenarioId, optionIndex, ageBand` | `{ text, source }` |
| `/api/class` | POST | `action=create` | `{ code }` |
| `/api/class` | POST | `action=join`, `code, nickname` | `{ ok }`, or 404 for an unknown code |
| `/api/class` | POST | `action=result`, `code, nickname, eco, green, quiz, topicStats[]` | updated `{ leaderboard, weakness }` |
| `/api/class` | GET | `code` | `{ leaderboard, weakness, players }` |

**The browser only sends ids.** The server looks up the scenario and option text
itself, so the endpoints cannot be used to send arbitrary prompts to Claude.

**Cost guards:** at most `AI_RATE_LIMIT_PER_IP` AI calls per IP per 10 minutes
(default 120) and `AI_DAILY_LIMIT` per day overall (default 5000). Past a limit,
the game silently uses fallback content. CORS is off unless `ALLOWED_ORIGINS` is set.

Claude calls use a **5-second timeout** for narration and hints and **20 seconds**
for quizzes, which the client requests in the background as soon as a quiz month
starts (the 5-minute quiz timer starts only when questions appear). Prompts use
structured JSON. Responses are validated server-side (narration ≤ 80 words, quiz =
10 questions × 4 options with a valid answer index, one-sentence explanations,
topic allow-list, content guard). Anything invalid → fallback content.
The key is read from `process.env.ANTHROPIC_API_KEY` only, is never logged,
and never appears in the client bundle (verified: `grep -r ANTHROPIC_API_KEY client/dist/` returns nothing).

## How to add scenarios / questions

**Scenarios** — edit `client/src/data/scenarios.js`, add an entry to `SCENARIOS`:

```js
{ id: 's33', title: '...', category: 'water',
  context: '...',
  options: [
    { label: '...', hint: 'Short hint, no outcome revealed.',
      effects: { eco: 8, budget: -4, health: 6, morale: 2, reputation: 4 },
      consequence: 'One-sentence outcome shown after the choice.' }
  ] }
```

Effects are meter deltas, clamped to 0–100 by the game. Budget: −10 ≈ ₦50,000.
Every scenario needs at least one option with `budget >= 0`, because options the
school cannot afford are disabled (the self-test checks this). Add `crunch: true`
for a budget-crunch scenario; two are placed in every year.
Then add a matching narration to `client/src/data/fallback-content.json`
(`narrations[]`, keyed by `scenarioId`, ≤ 80 words, with a `tip`).

**Quiz questions** — add to `fallback-content.json` (`questions[]`):

```json
{"q": "...", "options": ["a","b","c","d"], "answer": 1,
 "explanation": "One sentence.", "topic": "climate", "difficulty": 1}
```

Topics: `climate, waste, energy, water, sanitation, agriculture, disaster`.
Difficulty: 1 (easiest) to 3. Re-run `npm run test:fallback` after editing.

## Class Mode & NDPR notes

- **Nickname only.** Pupils join with a nickname and a teacher-generated session
  code (e.g. `GREEN-XXXX`). No real names, ages, school names, photos, emails or
  device identifiers are collected or stored.
- **Leaderboard** shows nicknames + Green Score / Eco / Quiz scores only.
- **Teacher dashboard:** after *Create teacher session code*, tap *Open teacher
  dashboard*. It refreshes every 10 seconds and can be bookmarked
  (`…/?teacher=GREEN-XXXX`). Pupils appear when they finish their year; replaying
  under the same nickname replaces their earlier score.
- **Topic-weakness report is anonymous** — it aggregates correct/wrong counts per
  topic across the class, so a teacher can screenshot it without identifying any child.
- **Local-first:** class results are also saved in the browser's localStorage under
  the session code, so a class works offline on one device.
- **Shared class storage:** on Vercel, add an **Upstash Redis** store from the
  Vercel Marketplace (it sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`). Sessions
  then work across every device and serverless instance and expire after 14 days.
  Check `/api/health` shows `"classStorage": "shared"`. Without it, sessions live
  in server memory: fine for `npm start` on one school network, but not reliable on
  Vercel, where each instance has its own memory.
  This build does **not** claim NDPA/NDPR compliance — it is designed to minimise
  personal data so a school's own data-protection review is straightforward.
- **Safeguarding:** all content is age-appropriate; AI prompts forbid political,
  religious, violent and medical content, and server-side validation rejects
  off-topic output in favour of the vetted fallback bank.

## UX & branding

- Harmony palette: deep teal `#005B60` + gold `#D9A62E`, rounded cards, big touch
  targets, clean sans-serif.
- Seasonal backgrounds: rainy (Apr–Oct), harmattan (Dec–Feb), dry season otherwise.
- Confetti on Gold/Platinum report cards. **Sound is OFF by default** (toggle in
  the header; no audio files, no autoplay).
- Low-bandwidth tolerant: the whole fallback game is a few hundred KB; no
  images, no fonts to download, no tracking scripts.

## Deploy to GitHub Pages (legacy — the move to Vercel was due 1 Nov 2026)

GitHub Pages serves static files only, so the Express/Claude backend does **not**
run there. The game still plays fully, using the built-in fallback storybook and
question bank — AI narration, AI quizzes and server class sessions are
unavailable on Pages. That is why the move to Vercel is planned for 1 Nov 2026.

1. Create a **public** repo named `climate-action-school` (free GitHub Pages
   requires a public repo).
2. Push the source to `main`, and push the built `client/dist/` contents
   (with `.nojekyll`) to a `gh-pages` branch.
3. In the repo: Settings → Pages → Build and deployment → Deploy from a branch
   → branch `gh-pages`, folder `/ (root)`. The site appears at
   `https://<username>.github.io/climate-action-school/`.
4. The client is built with a relative Vite base (`./`), so it works at that
   project URL as well as at a site root.

**By 1 Nov 2026:** deploy to Vercel (below, with the API key set in Vercel) and
then change the GitHub repo to **private**. Do not flip it to private before
the Vercel move, or the Pages site will stop working.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Build command: `npm run build` · Output directory: `client/dist`
   (both already set in `vercel.json`).
4. Environment variable (optional — game works without it):
   `ANTHROPIC_API_KEY` = your key. Never commit it; use the Vercel dashboard.
   Optionally set `ANTHROPIC_MODEL` (default `claude-haiku-4-5`).
5. Storage → add **Upstash Redis** from the Marketplace and connect it to the
   project, so Class Mode and rate limits are shared across instances.
6. Optionally tune `AI_RATE_LIMIT_PER_IP` and `AI_DAILY_LIMIT`.
7. Deploy. The `/api/*` functions run as serverless functions from `api/`.

## Known limitations

- The 12-turn year runs September–August: the September–July teaching year plus
  an August closing turn, so the turn count matches the brief.
- Without an Upstash Redis store, Vercel class sessions and rate limits are
  per-instance in memory (see NDPR notes above).
- Two pupils who pick the same nickname in one session share a leaderboard row.
- Vercel deployment itself has not been run from this machine (no Vercel
  credentials were supplied); the `vercel.json` follows Vercel's standard
  static-output + `api/` functions layout. Test the deploy after import and
  check `/api/health`.
- AI narration/quiz quality with a live key has not been verified yet — that
  step needs the founder's approval to supply the key (see below).

## Project layout

```
client/                 React + Vite frontend
  src/App.jsx           Game loop, quiz, report card, class mode
  src/TeacherDashboard.jsx  Live class view for teachers
  src/classStore.js     Class Mode helpers (API calls, on-device results)
  src/data/scenarios.js 32 scenarios + 4 budget crunches, months, seasons, running costs
  src/data/fallback-content.json  36 narrations + 60 quiz questions
  src/styles.css        Teal/gold theme, seasonal backgrounds, confetti
server/index.js         Local Express server (serves client/dist + /api)
api/_lib.cjs            Claude proxy, 5s timeout, validation, fallback
api/_store.cjs          Class sessions + rate limits (Upstash Redis or memory)
api/_limits.cjs         Client IP and AI cost limits
api/narrate.js api/quiz.js api/hint.js api/class.js api/health.js
scripts/test-fallback.js  Content self-test (no key)
scripts/test-api.js       API self-test: class mode, limits, safety filter
.github/workflows/ci.yml  Runs the tests and the build on every push/PR
vercel.json .env.example
```

---
Built for Harmony Digital Consults Ltd. Game content is educational and
Nigerian-curriculum themed; it is not a substitute for a school's own
climate, health or safety policies.
