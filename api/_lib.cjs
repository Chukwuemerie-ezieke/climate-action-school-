// Shared server-side AI logic for Climate Action School.
// Used by the Express server (server/index.js) AND by Vercel serverless
// functions (api/*.js). The Anthropic key is read here only, on the server.
// It is never sent to the browser, never logged, and never written to a file.
const path = require('path');

// Single source of truth for fallback content (also imported by the client).
const fallback = require('../client/src/data/fallback-content.json');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
const TIMEOUT_MS = 5000;
const AGE_BANDS = ['8-11', '12-14', '15-17'];

function ageBand(input) {
  return AGE_BANDS.includes(input) ? input : '12-14';
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function isCleanText(text) {
  // Age-appropriate guard: reject obvious off-topic / unsafe content.
  if (!text || typeof text !== 'string') return false;
  const banned = ['kill', 'murder', 'suicide', 'porn', 'sex ', 'terrorist', 'bomb '];
  return !banned.some((w) => text.toLowerCase().includes(w));
}

async function callClaude(system, user, maxTokens) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('no-key');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });
    if (!res.ok) throw new Error('claude-' + res.status);
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function extractJson(text) {
  // Claude sometimes wraps JSON in ```json fences; strip them defensively.
  const fenced = String(text || '').match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : String(text || '');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('no-json');
  return JSON.parse(raw.slice(start, end + 1));
}

function validateNarration(obj) {
  if (!obj || typeof obj.text !== 'string' || typeof obj.tip !== 'string') throw new Error('bad-narration');
  if (wordCount(obj.text) > 80 || wordCount(obj.text) < 10) throw new Error('bad-narration-length');
  if (!isCleanText(obj.text) || !isCleanText(obj.tip)) throw new Error('unsafe-narration');
  return { text: obj.text.trim(), tip: obj.tip.trim(), source: 'ai' };
}

function validateQuiz(obj) {
  if (!obj || !Array.isArray(obj.questions) || obj.questions.length < 5) throw new Error('bad-quiz');
  const topics = ['climate', 'waste', 'energy', 'water', 'sanitation', 'agriculture', 'disaster'];
  const questions = obj.questions.slice(0, 10).map((q) => {
    if (!q || typeof q.question !== 'string' || !Array.isArray(q.options) || q.options.length !== 4) throw new Error('bad-question');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) throw new Error('bad-answer');
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) throw new Error('bad-explanation');
    if (!isCleanText(q.question + ' ' + q.explanation)) throw new Error('unsafe-question');
    return {
      q: q.question, options: q.options.map(String), answer: q.answer,
      explanation: q.explanation, topic: topics.includes(q.topic) ? q.topic : 'climate',
      difficulty: [1, 2, 3].includes(q.difficulty) ? q.difficulty : 1
    };
  });
  return { questions, source: 'ai' };
}

function fallbackNarration(scenarioId) {
  const found = fallback.narrations.find((n) => n.scenarioId === scenarioId) || fallback.narrations[0];
  return { text: found.text, tip: found.tip, source: 'fallback' };
}

function fallbackQuiz(count = 10) {
  const shuffled = [...fallback.questions].sort(() => Math.random() - 0.5);
  return { questions: shuffled.slice(0, count), source: 'fallback' };
}

async function narrate({ scenarioId, scenarioTitle, scenarioContext, choiceLabel, consequence, ageBand: band }) {
  const b = ageBand(band);
  const system = `You are "Auntie Green", a warm Nigerian school narrator for children aged ${b}. ` +
    'Use age-appropriate Nigerian English; light Pidgin flavour is allowed. ' +
    'No political, religious, violent or medical content. Reply ONLY with JSON: {"text": "...", "tip": "..."}. ' +
    'The text must be at most 80 words, explain the real-world science of the consequence, be locally relevant ' +
    '(Lagos flooding, harmattan, solar vs kerosene, local crops where fitting), and end the whole reply with one constructive tip in the tip field.';
  try {
    const raw = await callClaude(system,
      `Scenario: ${scenarioTitle}. Context: ${scenarioContext}. The pupil chose: ${choiceLabel}. Consequence: ${consequence}. Age band: ${b}.`, 300);
    return validateNarration(extractJson(raw));
  } catch (e) {
    // Graceful fallback: never fail the game because AI is unreachable.
    return fallbackNarration(scenarioId);
  }
}

async function quiz({ ageBand: band, topics }) {
  const b = ageBand(band);
  const system = `You write quiz questions for Nigerian pupils aged ${b}, aligned to NERDC Basic Science & Technology and SSS Geography themes ` +
    '(climate, waste, energy, water, sanitation, agriculture, disaster risk). Age-appropriate only; no political, religious, violent or medical content. ' +
    'Reply ONLY with JSON: {"questions": [{"question": "...", "options": ["a","b","c","d"], "answer": 0, "explanation": "One sentence.", "topic": "climate", "difficulty": 1}]}. ' +
    'Write exactly 10 questions, 4 options each, exactly one correct answer, one-sentence explanations.';
  try {
    const raw = await callClaude(system, `Age band: ${b}. Topics to favour: ${(topics || []).join(', ') || 'all'}.`, 2000);
    return validateQuiz(extractJson(raw));
  } catch (e) {
    return fallbackQuiz(10);
  }
}

async function hint({ scenarioTitle, optionLabel, ageBand: band }) {
  const b = ageBand(band);
  const system = `You are "Auntie Green", a warm Nigerian school narrator for children aged ${b}. ` +
    'Give a SHORT hint (at most 25 words) about an option in a school climate game. Never reveal the outcome or say whether it is good or bad. ' +
    'Reply ONLY with JSON: {"text": "..."}. Age-appropriate only; no political, religious, violent or medical content.';
  try {
    const raw = await callClaude(system, `Scenario: ${scenarioTitle}. Option: ${optionLabel}. Age band: ${b}.`, 120);
    const obj = extractJson(raw);
    if (typeof obj.text !== 'string' || wordCount(obj.text) > 30 || !isCleanText(obj.text)) throw new Error('bad-hint');
    return { text: obj.text.trim(), source: 'ai' };
  } catch (e) {
    return { text: 'Think about what helps the school, the pupils and the planet — not just today, but next term too.', source: 'fallback' };
  }
}

module.exports = { narrate, quiz, hint, fallbackNarration, fallbackQuiz, fallback, ageBand, validateNarration, validateQuiz };
