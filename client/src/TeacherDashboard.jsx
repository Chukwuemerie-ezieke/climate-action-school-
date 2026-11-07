import React, { useEffect, useState } from 'react';
import { getJson, readLocalClass, summarise } from './classStore.js';

const REFRESH_MS = 10000;

// Live class view for teachers: leaderboard + anonymous topic-weakness report.
// Reads the shared server session; if the server is unreachable it shows
// results saved on this device instead.
export default function TeacherDashboard({ code, onExit }) {
  const [data, setData] = useState(null);
  const [source, setSource] = useState('loading'); // loading | server | device | missing
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await getJson('/api/class?code=' + encodeURIComponent(code));
        if (!alive) return;
        setData({ leaderboard: r.leaderboard || [], weakness: r.weakness || [] });
        setSource('server');
      } catch (e) {
        if (!alive) return;
        const local = summarise(readLocalClass(code));
        setData(local);
        setSource(e.status === 404 && !local.leaderboard.length ? 'missing' : 'device');
      }
      if (alive) setUpdated(new Date());
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(id); };
  }, [code]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] + '?teacher=' + code : '';

  return (
    <main className="card">
      <h1>👩🏾‍🏫 Teacher dashboard</h1>
      <p className="code">Session code: <strong>{code}</strong> — pupils choose Class Mode and enter this code with a nickname.</p>
      <p className="small">
        {source === 'loading' && 'Loading class results…'}
        {source === 'server' && `Live: refreshes every ${REFRESH_MS / 1000} seconds.`}
        {source === 'device' && 'The server is not reachable, so this shows only results saved on this device.'}
        {source === 'missing' && 'This code was not found on the server. Check the code, or create a new session.'}
        {updated && ` Last updated ${updated.toLocaleTimeString()}.`}
      </p>
      <p className="small">Bookmark this page to come back to it: <span className="mono">{shareUrl}</span></p>

      <h2>Leaderboard ({data ? data.leaderboard.length : 0} pupils finished)</h2>
      {data && data.leaderboard.length
        ? <ol>{data.leaderboard.map((p) => <li key={p.nickname}>{p.nickname} — Green Score {p.green ?? p.eco}, Eco {p.eco}, Quiz {p.quiz}%</li>)}</ol>
        : <p>No results yet. Pupils appear here when they finish their school year.</p>}

      <h2>Topic weakness report (anonymous)</h2>
      {data && data.weakness.length
        ? <ul>{data.weakness.map((w) => <li key={w.topic}>{w.topic}: {w.accuracy}% correct ({w.correct} right, {w.wrong} wrong)</li>)}</ul>
        : <p>No quiz data yet.</p>}
      <p className="small">Topics are reported for the whole class, never for an individual pupil.</p>

      <button className="btn secondary big" onClick={onExit}>Back to start</button>
    </main>
  );
}
