// API self-test (no Anthropic key, no Redis: uses the in-memory store).
// Usage: node scripts/test-api.js
const assert = require('assert');
process.env.ANTHROPIC_API_KEY = '';
delete process.env.KV_REST_API_URL; delete process.env.UPSTASH_REDIS_REST_URL;

function call(handler, { method = 'POST', query = {}, body = {}, ip = '10.0.0.1' } = {}) {
  return new Promise((resolve, reject) => {
    const req = { method, query, body, headers: { 'x-forwarded-for': ip } };
    const res = { status(code) { return { json: (data) => resolve({ code, data }) }; } };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

(async () => {
  const cls = require('../api/class.js');

  // --- Class Mode: create -> join -> result -> read ---
  const created = await call(cls, { query: { action: 'create' } });
  assert.strictEqual(created.code, 200);
  const code = created.data.code;
  assert.match(code, /^GREEN-[A-Z0-9]{4}$/);

  const badJoin = await call(cls, { query: { action: 'join' }, body: { code: 'GREEN-ZZZZ', nickname: 'Ada' } });
  assert.strictEqual(badJoin.code, 404, 'unknown code must be rejected on join');
  const join = await call(cls, { query: { action: 'join' }, body: { code: code.toLowerCase(), nickname: 'Ada' } });
  assert.strictEqual(join.code, 200, 'join is case-insensitive');

  // Result without a prior join must still put the pupil on the leaderboard.
  const r1 = await call(cls, { query: { action: 'result' }, body: { code, nickname: 'GreenStar', eco: 80, quiz: 70, topicStats: [{ topic: 'waste', correct: 3, wrong: 1 }, { topic: 'evil', correct: 9, wrong: 0 }] } });
  assert.strictEqual(r1.code, 200);
  assert.deepStrictEqual(r1.data.leaderboard, [{ nickname: 'GreenStar', eco: 80, quiz: 70 }], 'result response includes updated leaderboard');
  await call(cls, { query: { action: 'result' }, body: { code, nickname: 'Ada<script>', eco: 999, quiz: -5, topicStats: [{ topic: 'waste', correct: 1, wrong: 1 }] } });
  const read = await call(cls, { method: 'GET', query: { code } });
  assert.strictEqual(read.code, 200);
  assert.strictEqual(read.data.players, 2);
  const ada = read.data.leaderboard.find((p) => p.nickname === 'Adascript');
  assert.ok(ada, 'nickname is sanitised');
  assert.strictEqual(ada.eco, 100, 'scores are clamped');
  assert.strictEqual(ada.quiz, 0, 'scores are clamped');
  assert.deepStrictEqual(read.data.weakness, [{ topic: 'waste', correct: 4, wrong: 2, accuracy: 67 }], 'topic stats aggregate; unknown topics ignored');

  // Replay under the same nickname replaces the score.
  await call(cls, { query: { action: 'result' }, body: { code, nickname: 'GreenStar', eco: 90, quiz: 80, topicStats: [] } });
  const read2 = await call(cls, { method: 'GET', query: { code } });
  assert.strictEqual(read2.data.players, 2);
  assert.strictEqual(read2.data.leaderboard[0].eco, 90);

  const missing = await call(cls, { method: 'GET', query: { code: 'GREEN-0000' } });
  assert.strictEqual(missing.code, 404);

  console.log('API self-test PASSED');
})().catch((e) => { console.error('API self-test FAILED:', e); process.exit(1); });
