// GET /api/health — deployment check. Never reveals whether a key is valid,
// only whether one is configured.
const store = require('./_store.cjs');
module.exports = function handler(req, res) {
  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    mode: process.env.ANTHROPIC_API_KEY ? 'ai-with-fallback' : 'fallback-only',
    classStorage: store.hasRedis() ? 'shared' : 'memory'
  });
};
