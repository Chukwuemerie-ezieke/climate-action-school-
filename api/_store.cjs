// Small storage layer for class sessions and rate limits.
//
// If a Redis REST store is configured (Vercel KV / Upstash Redis via the
// Vercel Marketplace), data is shared by every serverless instance and every
// device, so Class Mode works across a whole classroom on Vercel.
// Without one, it falls back to process memory, which is fine for the local
// Express server (`npm start`) on a school network but is per-instance on Vercel.
//
// Only nicknames, scores and per-topic counts are stored. No real names,
// emails, ages, device identifiers or IP addresses are kept: rate-limit keys
// are a one-way hash of the IP and expire within minutes.

const crypto = require('crypto');

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const SESSION_TTL_SEC = 60 * 60 * 24 * 14; // class sessions expire after 14 days
const PREFIX = 'cas:';

function hasRedis() {
  return Boolean(REST_URL && REST_TOKEN);
}

async function redis(commands) {
  const res = await fetch(REST_URL.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + REST_TOKEN, 'content-type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error('store-' + res.status);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error('store-error');
    return r.result;
  });
}

// ---------- In-memory fallback ----------
const mem = new Map(); // key -> { value, expires }
function memGet(key) {
  const e = mem.get(key);
  if (!e) return undefined;
  if (e.expires && e.expires < Date.now()) { mem.delete(key); return undefined; }
  return e.value;
}
function memSet(key, value, ttlSec) {
  mem.set(key, { value, expires: ttlSec ? Date.now() + ttlSec * 1000 : 0 });
}
function memHash(key) {
  let h = memGet(key);
  if (!h) { h = {}; memSet(key, h, SESSION_TTL_SEC); }
  return h;
}

// ---------- Class sessions ----------
const keys = (code) => ({
  meta: PREFIX + 'class:' + code,
  players: PREFIX + 'class:' + code + ':players',
  topics: PREFIX + 'class:' + code + ':topics'
});

async function createSession(code) {
  const k = keys(code);
  if (hasRedis()) {
    const [ok] = await redis([['SET', k.meta, String(Date.now()), 'EX', SESSION_TTL_SEC, 'NX']]);
    return ok === 'OK';
  }
  if (memGet(k.meta)) return false;
  memSet(k.meta, Date.now(), SESSION_TTL_SEC);
  return true;
}

async function sessionExists(code) {
  const k = keys(code);
  if (hasRedis()) {
    const [n] = await redis([['EXISTS', k.meta]]);
    return n === 1;
  }
  return memGet(k.meta) !== undefined;
}

async function saveResult(code, nickname, { eco, green, quiz }, topicStats) {
  const k = keys(code);
  const player = JSON.stringify({ nickname, eco, green, quiz, at: Date.now() });
  if (hasRedis()) {
    const cmds = [['HSET', k.players, nickname, player]];
    topicStats.forEach((t) => {
      if (t.correct) cmds.push(['HINCRBY', k.topics, t.topic + ':correct', t.correct]);
      if (t.wrong) cmds.push(['HINCRBY', k.topics, t.topic + ':wrong', t.wrong]);
    });
    cmds.push(['EXPIRE', k.players, SESSION_TTL_SEC], ['EXPIRE', k.topics, SESSION_TTL_SEC]);
    await redis(cmds);
    return;
  }
  memHash(k.players)[nickname] = player;
  const topics = memHash(k.topics);
  topicStats.forEach((t) => {
    topics[t.topic + ':correct'] = (topics[t.topic + ':correct'] || 0) + t.correct;
    topics[t.topic + ':wrong'] = (topics[t.topic + ':wrong'] || 0) + t.wrong;
  });
}

async function getSession(code) {
  const k = keys(code);
  let exists; let playersRaw; let topicsRaw;
  if (hasRedis()) {
    const [e, p, t] = await redis([['EXISTS', k.meta], ['HGETALL', k.players], ['HGETALL', k.topics]]);
    exists = e === 1;
    // Upstash returns HGETALL as a flat [field, value, field, value, ...] list.
    const pairs = (arr) => {
      const o = {};
      for (let i = 0; i + 1 < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1];
      return o;
    };
    playersRaw = pairs(p); topicsRaw = pairs(t);
  } else {
    exists = memGet(k.meta) !== undefined;
    playersRaw = memGet(k.players) || {}; topicsRaw = memGet(k.topics) || {};
  }
  if (!exists) return null;
  const players = Object.values(playersRaw).map((v) => {
    try { return JSON.parse(v); } catch (e) { return null; }
  }).filter(Boolean);
  const topicStats = {};
  Object.entries(topicsRaw).forEach(([field, n]) => {
    const [topic, kind] = field.split(':');
    topicStats[topic] = topicStats[topic] || { correct: 0, wrong: 0 };
    topicStats[topic][kind] = Number(n) || 0;
  });
  return { players, topicStats };
}

// ---------- Rate limiting ----------
// Fixed-window counter. Returns true while `key` is under `limit` in the window.
async function hit(key, limit, windowSec) {
  const k = PREFIX + 'rl:' + key;
  if (hasRedis()) {
    const [n] = await redis([['INCR', k], ['EXPIRE', k, windowSec, 'NX']]);
    return n <= limit;
  }
  if (mem.size > 5000) sweep();
  const e = mem.get(k);
  if (!e || e.expires < Date.now()) {
    mem.set(k, { value: 1, expires: Date.now() + windowSec * 1000 });
    return 1 <= limit;
  }
  e.value += 1;
  return e.value <= limit;
}

function sweep() {
  const now = Date.now();
  for (const [k, e] of mem) if (e.expires && e.expires < now) mem.delete(k);
}

function hashIp(ip) {
  return crypto.createHash('sha256').update('cas:' + String(ip || 'unknown')).digest('hex').slice(0, 16);
}

module.exports = { hasRedis, createSession, sessionExists, saveResult, getSession, hit, hashIp, _mem: mem };
