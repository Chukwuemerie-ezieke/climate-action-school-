const { quiz } = require('./_lib.cjs');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = req.body || {};
  const result = await quiz({ ageBand: body.ageBand, topics: Array.isArray(body.topics) ? body.topics : [] });
  return res.status(200).json(result);
};
