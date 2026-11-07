// Request helpers shared by the API handlers.

function clientIp(req) {
  const h = (req && req.headers) || {};
  // Vercel sets x-forwarded-for / x-real-ip; Express falls back to the socket.
  const fwd = String(h['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || h['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = { clientIp };
