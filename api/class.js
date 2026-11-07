// Class sessions: nickname-only, no PII.
// Uses Vercel KV / Upstash Redis when configured (shared across devices and
// serverless instances); otherwise falls back to in-memory storage, which is
// fine for the local Express server on one school network.
const store = require('./_store.cjs');
const { clientIp } = require('./_limits.cjs');

const TOPICS = ['climate', 'waste', 'energy', 'water', 'sanitation', 'agriculture', 'disaster'];
const CODE_RE = /^GREEN-[A-Z0-9]{4}$/;

function newCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return 'GREEN-' + s;
}
function cleanCode(v) {
  const c = String(v || '').trim().toUpperCase();
  return CODE_RE.test(c) ? c : '';
}
function cleanNickname(v) {
  // Printable characters only, no angle brackets, max 20 characters.
  return String(v || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 20);
}
function score(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}
function count(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(50, n)) : 0;
}

function summarise(session) {
  // Rank by Green Score (all five meters) plus quiz; older results have no green score.
  const rank = (p) => (p.green ?? p.eco) + p.quiz;
  const leaderboard = session.players
    .map(({ nickname, eco, green, quiz }) => ({ nickname, eco, green: green ?? eco, quiz }))
    .sort((a, b) => rank(b) - rank(a));
  const weakness = Object.entries(session.topicStats)
    .map(([topic, v]) => ({
      topic, correct: v.correct, wrong: v.wrong,
      accuracy: v.correct + v.wrong ? Math.round(100 * v.correct / (v.correct + v.wrong)) : 0
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  return { leaderboard, weakness, players: leaderboard.length };
}

module.exports = async function handler(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const action = query.action || body.action;
  const ipKey = store.hashIp(clientIp(req));
  try {
    if (req.method === 'POST' && action === 'create') {
      if (!(await store.hit('create:' + ipKey, 30, 3600))) return res.status(429).json({ error: 'Too many sessions created. Try again later.' });
      for (let i = 0; i < 5; i++) {
        const c = newCode();
        if (await store.createSession(c)) return res.status(200).json({ code: c, shared: store.hasRedis() });
      }
      return res.status(503).json({ error: 'Could not create a code. Try again.' });
    }

    if (req.method === 'POST' && action === 'join') {
      const c = cleanCode(body.code);
      if (!c || !cleanNickname(body.nickname)) return res.status(400).json({ error: 'Invalid code or nickname' });
      if (!(await store.sessionExists(c))) return res.status(404).json({ error: 'Unknown session code' });
      return res.status(200).json({ ok: true, code: c });
    }

    if (req.method === 'POST' && action === 'result') {
      if (!(await store.hit('result:' + ipKey, 300, 600))) return res.status(429).json({ error: 'Too many results. Try again later.' });
      const c = cleanCode(body.code);
      const nickname = cleanNickname(body.nickname);
      if (!c || !nickname) return res.status(400).json({ error: 'Invalid code or nickname' });
      if (!(await store.sessionExists(c))) return res.status(404).json({ error: 'Unknown session code' });
      const topicStats = (Array.isArray(body.topicStats) ? body.topicStats : [])
        .filter((t) => t && TOPICS.includes(t.topic))
        .map((t) => ({ topic: t.topic, correct: count(t.correct), wrong: count(t.wrong) }));
      // A pupil is added to the class the first time their result arrives,
      // and a replay under the same nickname replaces their earlier score.
      await store.saveResult(c, nickname, { eco: score(body.eco), green: score(body.green ?? body.eco), quiz: score(body.quiz) }, topicStats);
      return res.status(200).json({ ok: true, ...summarise(await store.getSession(c)) });
    }

    if (req.method === 'GET') {
      if (!(await store.hit('read:' + ipKey, 600, 600))) return res.status(429).json({ error: 'Too many requests. Try again shortly.' });
      const c = cleanCode(query.code);
      const session = c ? await store.getSession(c) : null;
      if (!session) return res.status(404).json({ error: 'Unknown code' });
      return res.status(200).json(summarise(session));
    }

    return res.status(405).json({ error: 'Unsupported' });
  } catch (e) {
    // Storage unreachable: the client falls back to this device's localStorage.
    return res.status(503).json({ error: 'Class storage unavailable' });
  }
};
