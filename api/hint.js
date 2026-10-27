const { hint } = require('./_lib.cjs');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = req.body || {};
  const result = await hint({ scenarioTitle: body.scenarioTitle || '', optionLabel: body.optionLabel || '', ageBand: body.ageBand });
  return res.status(200).json(result);
};
