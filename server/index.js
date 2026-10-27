// Local dev server: Express proxy to Claude (via api/_lib.cjs) + static client.
// In production (Vercel), api/*.js run as serverless functions and the client
// is served as static output; this server is for local development and for
// classroom use on one local network (class sessions live in memory here).
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

app.post('/api/narrate', require('../api/narrate.js'));
app.post('/api/quiz', require('../api/quiz.js'));
app.post('/api/hint', require('../api/hint.js'));
app.all('/api/class', require('../api/class.js'));
app.get('/api/health', (req, res) => res.json({
  ok: true,
  aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  // Never reveal whether a key is valid, only whether one is configured.
  mode: process.env.ANTHROPIC_API_KEY ? 'ai-with-fallback' : 'fallback-only'
}));

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
