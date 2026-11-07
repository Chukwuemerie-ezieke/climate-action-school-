// Vercel serverless handler + Express-compatible handler for /api/narrate.
// The client sends only ids; scenario text is looked up on the server.
const { narrate } = require('./_lib.cjs');
const { allowAi } = require('./_limits.cjs');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = req.body || {};
  const result = await narrate(
    { scenarioId: String(body.scenarioId || ''), optionIndex: body.optionIndex, ageBand: body.ageBand },
    { ai: await allowAi(req) });
  return res.status(200).json(result);
};
