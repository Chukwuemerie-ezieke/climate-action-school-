// Local dev server: Express proxy to Claude (via api/_lib.cjs) + static client.
// In production (Vercel), api/*.js run as serverless functions and the client
// is served as static output; this server is for local development and for
// classroom use on one local network (class sessions live in memory here).
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
// CORS is off by default: the game calls its own API on the same origin, so
// other websites cannot use this server (and its Anthropic key) from a browser.
// Set ALLOWED_ORIGINS=https://a.example,https://b.example to allow others.
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (allowedOrigins.length) app.use('/api', cors({ origin: allowedOrigins }));
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.post('/api/narrate', require('../api/narrate.js'));
app.post('/api/quiz', require('../api/quiz.js'));
app.post('/api/hint', require('../api/hint.js'));
app.all('/api/class', require('../api/class.js'));
app.get('/api/health', require('../api/health.js'));

const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.get('/', (req, res) => res.send(
    'Climate Action School API is running. Build the client (npm run build) or run the Vite dev server (npm run dev:client).'));
}

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Climate Action School server on http://localhost:${PORT}`));
}
module.exports = app;
