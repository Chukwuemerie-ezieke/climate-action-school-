// Request helpers shared by the API handlers: client IP and AI rate limits.
//
// Limits protect the Anthropic bill. When a limit is reached the game is NOT
// blocked: the handler simply serves the built-in fallback content instead of
// calling Claude. Many pupils in one school can share one IP address, which is
// why the per-IP limit is generous and degrades gracefully.
const store = require('./_store.cjs');

const PER_IP_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_IP) || 120; // AI calls per IP per window
const PER_IP_WINDOW_SEC = 600;                                          // 10 minutes
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 5000;         // AI calls per day, all users

function clientIp(req) {
  const h = (req && req.headers) || {};
  // Forwarding headers can be forged by the caller unless a trusted proxy sets
  // them. Vercel does; for the Express server set TRUST_PROXY=1 only if it runs
  // behind a reverse proxy.
  if (process.env.VERCEL || process.env.TRUST_PROXY) {
    const fwd = String(h['x-forwarded-for'] || '').split(',')[0].trim();
    if (fwd || h['x-real-ip']) return fwd || h['x-real-ip'];
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

// Resolves true if this request may call Claude. Fails closed: if the limit
// store is unreachable, use fallback content rather than risk unbounded spend.
async function allowAi(req) {
  if (!process.env.ANTHROPIC_API_KEY) return false;
  try {
    const day = new Date().toISOString().slice(0, 10);
    if (!(await store.hit('ai:ip:' + store.hashIp(clientIp(req)), PER_IP_LIMIT, PER_IP_WINDOW_SEC))) return false;
    return await store.hit('ai:day:' + day, DAILY_LIMIT, 60 * 60 * 26);
  } catch (e) {
    return false;
  }
}

module.exports = { clientIp, allowAi };
