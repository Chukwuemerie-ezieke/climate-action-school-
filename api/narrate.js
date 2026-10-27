// Vercel serverless handler + Express-compatible handler for /api/narrate
const { narrate } = require('./_lib.cjs');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = req.body || {};
  // scenarioId is used only to pick the right fallback narration; it is not PII.
  const result = await narrate({
    scenarioId: body.scenarioId, scenarioTitle: body.scenarioTitle || '',
    scenarioContext: body.scenarioContext || '', choiceLabel: body.choiceLabel || '',
    consequence: body.consequence || '', ageBand: body.ageBand
  });
  return res.status(200).json(result);
};
