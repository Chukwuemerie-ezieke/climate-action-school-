// Lightweight class sessions: nickname-only, no PII, in-memory.
// NOTE: on Vercel serverless this store is per-instance and not durable;
// for a classroom on one local network, run `npm run dev:server` instead.
// LocalStorage fallback in the client covers fully-offline play.
const sessions = new Map();
function code() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return 'GREEN-' + s;
}
module.exports = async function handler(req, res) {
  const action = (req.query && req.query.action) || (req.body && req.body.action);
  if (req.method === 'POST' && action === 'create') {
    const c = code();
    sessions.set(c, { players: [], topicStats: {} });
    return res.status(200).json({ code: c });
  }
  if (req.method === 'POST' && action === 'join') {
    const c = String((req.body || {}).code || '').toUpperCase();
    const nickname = String((req.body || {}).nickname || '').slice(0, 20).trim();
    if (!sessions.has(c) || !nickname) return res.status(400).json({ error: 'Invalid code or nickname' });
    const s = sessions.get(c);
    if (!s.players.find((p) => p.nickname === nickname)) s.players.push({ nickname, eco: 0, quiz: 0 });
    return res.status(200).json({ ok: true, code: c });
  }
  if (req.method === 'POST' && action === 'result') {
    const body = req.body || {};
    const c = String(body.code || '').toUpperCase();
    if (!sessions.has(c)) return res.status(400).json({ error: 'Unknown code' });
    const s = sessions.get(c);
    const p = s.players.find((x) => x.nickname === String(body.nickname || '').slice(0, 20));
    if (p) { p.eco = body.eco || 0; p.quiz = body.quiz || 0; }
    (body.topicStats || []).forEach((t) => {
      s.topicStats[t.topic] = s.topicStats[t.topic] || { correct: 0, wrong: 0 };
      s.topicStats[t.topic].correct += t.correct || 0;
      s.topicStats[t.topic].wrong += t.wrong || 0;
    });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'GET') {
    const c = String((req.query || {}).code || '').toUpperCase();
    if (!sessions.has(c)) return res.status(404).json({ error: 'Unknown code' });
    const s = sessions.get(c);
    const leaderboard = [...s.players].sort((a, b) => (b.eco + b.quiz) - (a.eco + a.quiz));
    const weakness = Object.entries(s.topicStats)
      .map(([topic, v]) => ({ topic, correct: v.correct, wrong: v.wrong, accuracy: v.correct + v.wrong ? Math.round(100 * v.correct / (v.correct + v.wrong)) : 0 }))
      .sort((a, b) => a.accuracy - b.accuracy);
    return res.status(200).json({ leaderboard, weakness });
  }
  return res.status(405).json({ error: 'Unsupported' });
};
