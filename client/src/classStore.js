// Class Mode helpers shared by the game and the teacher dashboard.

export const CODE_RE = /^GREEN-[A-Z0-9]{4}$/;
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export async function postJson(path, body, timeoutMs = 6000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeoutMs);
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: c.signal });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error('http-' + r.status); e.status = r.status; e.data = data; throw e; }
    return data;
  } finally { clearTimeout(t); }
}

export async function getJson(path, timeoutMs = 6000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeoutMs);
  try {
    const r = await fetch(path, { signal: c.signal });
    if (!r.ok) { const e = new Error('http-' + r.status); e.status = r.status; throw e; }
    return await r.json();
  } finally { clearTimeout(t); }
}

// Used only when the server is unreachable (e.g. GitHub Pages or no internet).
export function offlineCode() {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return 'GREEN-' + s;
}

const localKey = (code) => 'cas-class-' + code;

export function readLocalClass(code) {
  try {
    const raw = localStorage.getItem(localKey(code));
    return raw ? JSON.parse(raw) : { players: [], topicStats: {} };
  } catch (e) { return { players: [], topicStats: {} }; }
}

export function saveLocalResult(code, nickname, { eco, green, quiz }, stats) {
  const data = readLocalClass(code);
  const existing = data.players.find((p) => p.nickname === nickname);
  if (existing) Object.assign(existing, { eco, green, quiz }); else data.players.push({ nickname, eco, green, quiz });
  Object.entries(stats).forEach(([topic, v]) => {
    data.topicStats[topic] = data.topicStats[topic] || { correct: 0, wrong: 0 };
    data.topicStats[topic].correct += v.correct || 0;
    data.topicStats[topic].wrong += v.wrong || 0;
  });
  try { localStorage.setItem(localKey(code), JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
  return data;
}

// Leaderboard rank: Green Score (all five meters) plus quiz percentage.
export const rankScore = (p) => (p.green ?? p.eco) + p.quiz;

export function summarise(data) {
  const leaderboard = [...data.players].sort((a, b) => rankScore(b) - rankScore(a));
  const weakness = Object.entries(data.topicStats)
    .map(([topic, v]) => ({ topic, correct: v.correct, wrong: v.wrong, accuracy: v.correct + v.wrong ? Math.round(100 * v.correct / (v.correct + v.wrong)) : 0 }))
    .sort((a, b) => a.accuracy - b.accuracy);
  return { leaderboard, weakness };
}
