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
- **Fully playable offline:** if Claude is unreachable, slow (> 5 seconds), or no key
  is configured, the game falls back to the built-in storybook and question bank —
  no error, no dead end.

## Game loop

1. **Onboarding** — pick an age band (8–11 / 12–14 / 15–17). The age band is sent
   with every Claude call so language and difficulty scale. Choose Solo or Class Mode.
2. **Dashboard** — 5 animated meters: Eco Score, Budget (starts at ₦500,000;
   meter 100 = ₦500,000), Health & Safety, Student Morale, School Reputation.
   Month indicator, scenario card, decision buttons. Tap **💡 Hint** on any option
   for a short Auntie Green hint that never reveals the outcome.
3. **Scenarios** — 12 turns drawn at random from a pool of **32 Nigerian scenarios**
   (generator fuel, plastic-blocked drainage, dusty fields, leaking boreholes,
   harmattan, Lagos-style flooding, solar vs kerosene, school farms and more).
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
   Champion**, with Green Sprout below Bronze), confetti on Gold+, and 3–5 real
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

### Self-test (fallback path, no key needed)

```bash
npm run test:fallback
# PASSED: scenarios=32 narrations=32 questions=60
```

## API endpoints (server only)

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/health` | GET | — | `{ ok, aiConfigured, mode }` (never reveals key validity) |
| `/api/narrate` | POST | `scenarioId, scenarioTitle, scenarioContext, choiceLabel, consequence, ageBand` | `{ text, tip, source: "ai" \| "fallback" }` |
| `/api/quiz` | POST | `ageBand, topics[]` | `{ questions: [...10], source }` |
| `/api/hint` | POST | `scenarioTitle, optionLabel, ageBand` | `{ text, source }` |
| `/api/class` | POST/GET | `action=create\|join\|result`, `code, nickname` | session code, leaderboard, anonymous topic weakness |

Claude calls use a **5-second timeout** (`AbortController`) and structured-JSON
prompts. Responses are validated server-side (narration ≤ 80 words, quiz =
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
- **Leaderboard** shows nicknames + Eco/Quiz scores only.
- **Topic-weakness report is anonymous** — it aggregates correct/wrong counts per
  topic across the class, so a teacher can screenshot it without identifying any child.
- **Local-first:** class results are also saved in the browser's localStorage under
  the session code, so a class works offline on one device.
- **Server sessions are in-memory and not durable** on Vercel serverless (instances
  do not share memory). For multi-device classroom use, run the Express server
  (`npm start`) on one local network, or add a small database session store later.
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

## Deploy to GitHub Pages (temporary, until 1 Nov 2026)

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
5. Deploy. The `/api/*` functions run as serverless functions from `api/`.

## Known limitations

- The 12-turn year runs September–August: the September–July teaching year plus
  an August closing turn, so the turn count matches the brief.
- Vercel class sessions are per-instance in-memory (see NDPR notes above).
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
  src/data/scenarios.js 32 scenarios, months, seasons
  src/data/fallback-content.json  32 narrations + 60 quiz questions
  src/styles.css        Teal/gold theme, seasonal backgrounds, confetti
server/index.js         Local Express server (serves client/dist + /api)
api/_lib.cjs            Claude proxy, 5s timeout, validation, fallback
api/narrate.js api/quiz.js api/hint.js api/class.js
scripts/test-fallback.js  Offline self-test (no key)
vercel.json .env.example
```

---
Built for Harmony Digital Consults Ltd. Game content is educational and
Nigerian-curriculum themed; it is not a substitute for a school's own
climate, health or safety policies.
