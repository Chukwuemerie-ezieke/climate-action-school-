import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SCENARIOS, SCHOOL_MONTHS, seasonForMonth, shuffle } from './data/scenarios.js';
import fallback from './data/fallback-content.json';

const METERS = [
  { key: 'eco', label: 'Eco Score', icon: '🌿' },
  { key: 'budget', label: 'Budget', icon: '💰' },
  { key: 'health', label: 'Health & Safety', icon: '🛡️' },
  { key: 'morale', label: 'Student Morale', icon: '😊' },
  { key: 'reputation', label: 'School Reputation', icon: '⭐' }
];
const TOPICS = ['climate', 'waste', 'energy', 'water', 'sanitation', 'agriculture', 'disaster'];
const INITIAL_METERS = { eco: 50, budget: 100, health: 70, morale: 70, reputation: 60 };
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const naira = (meter) => '₦' + (meter * 5000).toLocaleString('en-NG');

async function postJson(path, body, timeoutMs = 6000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeoutMs);
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: c.signal });
    if (!r.ok) throw new Error('http-' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
function localNarration(scenarioId) {
  const f = fallback.narrations.find((n) => n.scenarioId === scenarioId) || fallback.narrations[0];
  return { text: f.text, tip: f.tip, source: 'fallback' };
}
function pickAdaptive(pool, topic, difficulty) {
  const exact = pool.filter((q) => q.topic === topic && q.difficulty === difficulty);
  if (exact.length) return exact[0];
  const byTopic = pool.filter((q) => q.topic === topic);
  if (byTopic.length) return byTopic.sort((a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty))[0];
  return pool[0];
}
function heroLevel(eco) {
  if (eco >= 85) return 'Platinum Eco Champion';
  if (eco >= 70) return 'Gold Eco Hero';
  if (eco >= 55) return 'Silver Eco Hero';
  if (eco >= 40) return 'Bronze Eco Hero';
  return 'Green Sprout';
}
function realActions(meters, weakTopics) {
  const bank = {
    eco: 'Plant and care for one tree or shrub in your school compound.',
    budget: 'Start a reuse corner: collect bottles, paper and old books for reuse or recycling.',
    health: 'Check that handwashing water and soap are available every school day.',
    morale: 'Run a weekly Green Club meeting where pupils share one climate idea.',
    reputation: 'Share your school green wins on the notice board for parents to see.'
  };
  const weak = [...METERS].sort((a, b) => meters[a.key] - meters[b.key]).slice(0, 3).map((m) => bank[m.key]);
  const topicAction = {
    waste: 'Organise a litter-pick and sort waste into paper, plastic and food scraps.',
    water: 'Report leaking taps the same day you spot them.',
    energy: 'Switch off lights and fans in empty classrooms.',
    climate: 'Plant a windbreak hedge to cut dust and cool classrooms.',
    sanitation: 'Keep toilets clean and handwashing stations filled.',
    agriculture: 'Start a small school garden with mixed crops and mulch.',
    disaster: 'Learn your school flood safety route and share it at home.'
  };
  const extra = (weakTopics || []).slice(0, 2).map((t) => topicAction[t]).filter(Boolean);
  return [...new Set([...weak, ...extra])].slice(0, 5);
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    left: (i * 37) % 100, delay: (i % 10) * 0.15, color: ['#D9A62E', '#005B60', '#2E9E6B', '#FFD166'][i % 4]
  })), []);
  return <div className="confetti" aria-hidden="true">{pieces.map((p, i) => <span key={i} style={{ left: p.left + '%', animationDelay: p.delay + 's', background: p.color }} />)}</div>;
}

function Meter({ label, icon, value, isBudget }) {
  return (
    <div className="meter">
      <div className="meter-head"><span>{icon} {label}</span><strong>{isBudget ? naira(value) : value + '/100'}</strong></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: value + '%' }} /></div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [ageBand, setAgeBand] = useState('12-14');
  const [mode, setMode] = useState('solo'); // solo | class
  const [nickname, setNickname] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [meters, setMeters] = useState(INITIAL_METERS);
  const [turn, setTurn] = useState(0);
  const [order, setOrder] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [narration, setNarration] = useState(null);
  const [narrating, setNarrating] = useState(false);
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(false); // sound OFF by default
  const [history, setHistory] = useState([]);
  // Quiz state
  const [quizMode, setQuizMode] = useState('ai');
  const [quizList, setQuizList] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizPool, setQuizPool] = useState([]);
  const [quizTopicIdx, setQuizTopicIdx] = useState(0);
  const [quizDifficulty, setQuizDifficulty] = useState({});
  const [quizStreak, setQuizStreak] = useState({});
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizTime, setQuizTime] = useState(300);
  const [quizSource, setQuizSource] = useState('fallback');
  const [topicStats, setTopicStats] = useState({});
  const [quizTotal, setQuizTotal] = useState({ correct: 0, total: 0 });
  const [levelNote, setLevelNote] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [weakness, setWeakness] = useState([]);
  const timerRef = useRef(null);
  const quizAnswersRef = useRef([]);
  useEffect(() => { quizAnswersRef.current = quizAnswers; });

  const month = SCHOOL_MONTHS[turn] || 'August';
  const season = seasonForMonth(month);
  const scenario = order[turn] ? SCENARIOS.find((s) => s.id === order[turn]) : null;
  const isQuizTurn = (turn + 1) % 3 === 0;

  function clickSound() {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 660;
      g.gain.setValueAtTime(0.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start(); o.stop(ctx.currentTime + 0.15);
    } catch (e) { /* sound is optional */ }
  }

  function startGame() {
    clickSound();
    setOrder(shuffle(SCENARIOS).slice(0, 12).map((s) => s.id));
    setMeters(INITIAL_METERS); setTurn(0); setHistory([]); setTopicStats({}); setQuizTotal({ correct: 0, total: 0 });
    setChosen(null); setNarration(null); setScreen('play');
  }
  async function createTeacherCode() {
    try {
      const r = await postJson('/api/class?action=create', { action: 'create' });
      setTeacherCode(r.code); setSessionCode(r.code);
    } catch (e) {
      const c = 'GREEN-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      setTeacherCode(c); setSessionCode(c);
    }
  }
  function classKey(code) { return 'cas-class-' + code; }
  function saveLocalResult(code, nick, eco, quizPct, stats) {
    try {
      const raw = localStorage.getItem(classKey(code));
      const data = raw ? JSON.parse(raw) : { players: [], topicStats: {} };
      const existing = data.players.find((p) => p.nickname === nick);
      if (existing) { existing.eco = eco; existing.quiz = quizPct; } else data.players.push({ nickname: nick, eco, quiz: quizPct });
      Object.entries(stats).forEach(([topic, v]) => {
        data.topicStats[topic] = data.topicStats[topic] || { correct: 0, wrong: 0 };
        data.topicStats[topic].correct += v.correct || 0; data.topicStats[topic].wrong += v.wrong || 0;
      });
      localStorage.setItem(classKey(code), JSON.stringify(data));
      return data;
    } catch (e) { return { players: [], topicStats: {} }; }
  }

  async function choose(option) {
    if (chosen) return;
    clickSound();
    setChosen(option);
    const next = { ...meters };
    Object.entries(option.effects).forEach(([k, v]) => { next[k] = clamp((next[k] || 0) + v); });
    setMeters(next);
    setHistory((h) => [...h, { month, scenario: scenario.title, choice: option.label }]);
    setNarrating(true);
    try {
      const r = await postJson('/api/narrate', {
        scenarioId: scenario.id, scenarioTitle: scenario.title, scenarioContext: scenario.context,
        choiceLabel: option.label, consequence: option.consequence, ageBand
      });
      setNarration(r && r.text ? r : localNarration(scenario.id));
    } catch (e) { setNarration(localNarration(scenario.id)); }
    setNarrating(false);
  }
  async function showHint(option) {
    clickSound();
    setHintLoading(true); setHint('');
    try {
      const r = await postJson('/api/hint', { scenarioTitle: scenario.title, optionLabel: option.label, ageBand });
      setHint(r && r.text ? r.text : option.hint);
    } catch (e) { setHint(option.hint); }
    setHintLoading(false);
  }
  function nextTurn() {
    setChosen(null); setNarration(null); setHint('');
    if (isQuizTurn) { startQuiz(); return; }
    if (turn + 1 >= 12) { finishYear(); return; }
    setTurn(turn + 1);
  }

  async function startQuiz() {
    setScreen('quiz'); setQuizAnswers([]); setQuizSelected(null); setQuizTime(300); setLevelNote('');
    setQuizDifficulty(Object.fromEntries(TOPICS.map((t) => [t, 1])));
    setQuizStreak({}); setQuizTopicIdx(0);
    const weakTopics = Object.entries(topicStats).sort((a, b) => (a[1].wrong - a[1].correct) - (b[1].wrong - b[1].correct)).map(([t]) => t);
    try {
      const r = await postJson('/api/quiz', { ageBand, topics: weakTopics });
      if (r && Array.isArray(r.questions) && r.questions.length >= 5) {
        setQuizSource(r.source || 'ai'); setQuizMode('ai'); setQuizList(r.questions); setQuizIndex(0); return;
      }
      throw new Error('bad-quiz');
    } catch (e) {
      setQuizSource('fallback'); setQuizMode('adaptive');
      const pool = shuffle(fallback.questions);
      const firstTopic = TOPICS[0];
      const first = pickAdaptive(pool, firstTopic, 1);
      setQuizPool(pool.filter((q) => q !== first)); setQuizList([first]); setQuizIndex(0);
    }
  }
  const currentQuiz = quizList[quizIndex];
  useEffect(() => {
    if (screen !== 'quiz') { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setQuizTime((t) => {
      if (t <= 1) { clearInterval(timerRef.current); finishQuiz(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, quizIndex]);
  function answerQuiz(idx) {
    if (quizSelected !== null || !currentQuiz) return;
    clickSound();
    const correct = idx === currentQuiz.answer;
    setQuizSelected(idx);
    const topic = currentQuiz.topic;
    setTopicStats((s) => {
      const prev = s[topic] || { correct: 0, wrong: 0 };
      return { ...s, [topic]: { correct: prev.correct + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1) } };
    });
    setQuizAnswers((a) => [...a, { topic, correct }]);
    // Adaptive difficulty, tracked per topic: 3 correct in a row -> harder; 2 wrong -> easier.
    const st = quizStreak[topic] || { c: 0, w: 0 };
    const streak = correct ? { c: st.c + 1, w: 0 } : { c: 0, w: st.w + 1 };
    setQuizStreak({ ...quizStreak, [topic]: streak });
    const curDiff = quizDifficulty[topic] || 1;
    if (correct && streak.c >= 3 && curDiff < 3) { setLevelNote('Level up! ' + topic + ' questions get harder.'); setQuizDifficulty({ ...quizDifficulty, [topic]: curDiff + 1 }); }
    else if (!correct && streak.w >= 2 && curDiff > 1) { setLevelNote('Taking it easier on ' + topic + ' for now.'); setQuizDifficulty({ ...quizDifficulty, [topic]: curDiff - 1 }); }
  }
  function nextQuizQuestion() {
    setQuizSelected(null); setLevelNote('');
    if (quizMode === 'ai') {
      if (quizIndex + 1 >= quizList.length) { finishQuiz(); return; }
      setQuizIndex(quizIndex + 1); return;
    }
    if (quizAnswers.length + 1 >= 10) { finishQuiz(); return; }
    const nextTopicIdx = (quizTopicIdx + 1) % TOPICS.length;
    const topic = TOPICS[nextTopicIdx];
    const diff = quizDifficulty[topic] || 1;
    const nextQ = pickAdaptive(quizPool, topic, diff);
    setQuizTopicIdx(nextTopicIdx);
    setQuizPool(quizPool.filter((q) => q !== nextQ));
    setQuizList((l) => [...l, nextQ]); setQuizIndex(quizIndex + 1);
  }
  function finishQuiz() {
    if (timerRef.current) clearInterval(timerRef.current);
    const answers = quizAnswersRef.current.length ? quizAnswersRef.current : quizAnswers;
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length || 1;
    const newTotals = { correct: quizTotal.correct + correct, total: quizTotal.total + total };
    setQuizTotal(newTotals);
    setChosen(null); setNarration(null); setHint('');
    if (turn + 1 >= 12) { finishYear(newTotals); return; }
    setTurn(turn + 1); setScreen('play');
  }
  function finishYear(passedTotals) {
    const totals = passedTotals || quizTotal;
    const quizPct = totals.total ? Math.round(100 * totals.correct / totals.total) : 0;
    const weakTopics = Object.entries(topicStats).map(([topic, v]) => ({ topic, correct: v.correct, wrong: v.wrong, accuracy: v.correct + v.wrong ? Math.round(100 * v.correct / (v.correct + v.wrong)) : 0 })).sort((a, b) => a.accuracy - b.accuracy);
    setWeakness(weakTopics);
    if (mode === 'class' && nickname && sessionCode) {
      const data = saveLocalResult(sessionCode, nickname, meters.eco, quizPct, topicStats);
      const lb = [...data.players].sort((a, b) => (b.eco + b.quiz) - (a.eco + a.quiz));
      setLeaderboard(lb);
      postJson('/api/class?action=result', { action: 'result', code: sessionCode, nickname, eco: meters.eco, quiz: quizPct, topicStats: weakTopics }).catch(() => {});
      fetch('/api/class?code=' + encodeURIComponent(sessionCode)).then((r) => r.json()).then((r) => {
        if (r.leaderboard) setLeaderboard(r.leaderboard);
        if (r.weakness) setWeakness(r.weakness);
      }).catch(() => {});
    }
    setScreen('report');
  }

  const quizPct = quizTotal.total ? Math.round(100 * quizTotal.correct / quizTotal.total) : 0;
  const level = heroLevel(meters.eco);
  const showConfetti = screen === 'report' && meters.eco >= 70;

  return (
    <div className={`app season-${season}`}>
      <header className="topbar">
        <div><strong>🌿 Climate Action School</strong><span className="brand">Harmony Digital Consults Ltd · Greenfield Model School</span></div>
        <button className="sound-btn" onClick={() => setSoundOn(!soundOn)} aria-label="Toggle sound">{soundOn ? '🔊 Sound on' : '🔇 Sound off'}</button>
      </header>

      {screen === 'onboarding' && (
        <main className="card">
          <h1>Welcome, Environment Prefect!</h1>
          <p>Run Greenfield Model School for one school year. Each month, a real Nigerian school problem lands on your desk. Your choices move five meters — and Auntie Green explains the science behind what happens.</p>
          <h2>Choose your age band</h2>
          <div className="choices">
            {['8-11', '12-14', '15-17'].map((b) => (
              <button key={b} className={ageBand === b ? 'choice active' : 'choice'} onClick={() => setAgeBand(b)}>{b} years</button>
            ))}
          </div>
          <h2>Play solo or in class?</h2>
          <div className="choices">
            <button className={mode === 'solo' ? 'choice active' : 'choice'} onClick={() => setMode('solo')}>Solo play</button>
            <button className={mode === 'class' ? 'choice active' : 'choice'} onClick={() => setMode('class')}>Class Mode</button>
          </div>
          {mode === 'class' && (
            <div className="class-box">
              <p><strong>Teachers:</strong> create a session code and share it with pupils. <strong>Pupils:</strong> join with a nickname only — no real names, no personal details.</p>
              <button className="btn secondary" onClick={createTeacherCode}>Create teacher session code</button>
              {teacherCode && <p className="code">Your session code: <strong>{teacherCode}</strong> — share it in class.</p>}
              <label>Nickname (pupils) <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 20))} placeholder="e.g. GreenStar" /></label>
              <label>Session code <input value={sessionCode} onChange={(e) => setSessionCode(e.target.value.toUpperCase())} placeholder="GREEN-XXXX" /></label>
              <p className="small">NDPR-friendly: only a nickname and a session code are used. Nothing that identifies a real child is collected.</p>
            </div>
          )}
          <button className="btn primary big" onClick={startGame} disabled={mode === 'class' && (!nickname.trim() || !sessionCode.trim())}>Start the school year ▶</button>
          <p className="small">12 months · quizzes every 3rd month · plays fully offline if the internet is down. Sound is off by default.</p>
        </main>
      )}

      {screen === 'play' && scenario && (
        <main>
          <div className="monthbar"><span>📅 {month} · Month {turn + 1} of 12</span><span className="season-tag">{season === 'rainy' ? '🌧️ Rainy season' : season === 'harmattan' ? '🌬️ Harmattan' : '☀️ Dry season'}</span></div>
          <div className="meters">{METERS.map((m) => <Meter key={m.key} label={m.label} icon={m.icon} value={meters[m.key]} isBudget={m.key === 'budget'} />)}</div>
          <section className="card scenario-card">
            <span className="tag">{scenario.category}</span>
            <h2>{scenario.title}</h2>
            <p>{scenario.context}</p>
            {!chosen && <p className="small">Tap an option for an Auntie Green hint (it will not reveal the outcome).</p>}
            <div className="options">
              {scenario.options.map((o, i) => (
                <button key={i} className="option" disabled={!!chosen} onClick={() => choose(o)}>
                  <span>{o.label}</span>
                  {!chosen && <span className="hint-link" onClick={(e) => { e.stopPropagation(); showHint(o); }}>💡 Hint</span>}
                </button>
              ))}
            </div>
            {hintLoading && <p className="hint">Auntie Green is thinking…</p>}
            {hint && !chosen && <p className="hint">💡 Auntie Green hint: {hint}</p>}
          </section>
          {chosen && (
            <section className="card narration">
              <h3>🌿 Auntie Green says</h3>
              {narrating ? <p>Listening to Auntie Green…</p> : narration && <><p>{narration.text}</p><p><strong>Try this:</strong> {narration.tip}</p><p className="small">Source: {narration.source === 'ai' ? 'Auntie Green (AI)' : 'Auntie Green storybook (offline)'} · {chosen.consequence}</p></>}
              <button className="btn primary" onClick={nextTurn} disabled={narrating}>{isQuizTurn ? 'Take the quiz ✏️' : turn + 1 >= 12 ? 'See my Report Card 🏆' : 'Next month ▶'}</button>
            </section>
          )}
        </main>
      )}

      {screen === 'quiz' && (
        <main className="card">
          <h2>✏️ Climate Quiz — Question {quizIndex + 1} of 10</h2>
          <p>Time left: <strong>{Math.floor(quizTime / 60)}:{String(quizTime % 60).padStart(2, '0')}</strong> · Source: {quizSource === 'ai' ? 'AI questions' : 'Question bank (offline)'} · Adaptive level: {currentQuiz ? quizDifficulty[currentQuiz.topic] || 1 : 1}/3</p>
          {levelNote && <p className="hint">{levelNote}</p>}
          {currentQuiz ? (
            <>
              <span className="tag">{currentQuiz.topic}</span>
              <h3>{currentQuiz.q}</h3>
              <div className="options">
                {currentQuiz.options.map((o, i) => (
                  <button key={i} className={'option' + (quizSelected === i ? (i === currentQuiz.answer ? ' correct' : ' wrong') : '')} disabled={quizSelected !== null} onClick={() => answerQuiz(i)}>{o}</button>
                ))}
              </div>
              {quizSelected !== null && (
                <div className="narration">
                  <p>{quizSelected === currentQuiz.answer ? '✅ Correct!' : '❌ Not quite — the answer is: ' + currentQuiz.options[currentQuiz.answer]}</p>
                  <p>{currentQuiz.explanation}</p>
                  <button className="btn primary" onClick={nextQuizQuestion}>{quizIndex + 1 >= 10 && quizMode === 'ai' ? 'Finish quiz' : 'Next question ▶'}</button>
                </div>
              )}
            </>
          ) : <p>Loading questions…</p>}
        </main>
      )}

      {screen === 'report' && (
        <main className="card report">
          {showConfetti && <Confetti />}
          <h1>🏆 School Green Report Card</h1>
          <p className="hero-level">{level}</p>
          <p>Eco Score: <strong>{meters.eco}/100</strong> · Quiz: <strong>{quizPct}%</strong> ({quizTotal.correct}/{quizTotal.total})</p>
          <div className="meters">{METERS.map((m) => <Meter key={m.key} label={m.label} icon={m.icon} value={meters[m.key]} isBudget={m.key === 'budget'} />)}</div>
          <h2>Real actions for your actual school</h2>
          <ol>{realActions(meters, weakness.map((w) => w.topic)).map((a, i) => <li key={i}>{a}</li>)}</ol>
          {mode === 'class' && (
            <>
              <h2>Class leaderboard — {sessionCode}</h2>
              {leaderboard.length ? <ol>{leaderboard.map((p, i) => <li key={i}>{p.nickname} — Eco {p.eco}, Quiz {p.quiz}%</li>)}</ol> : <p>No class results saved on this device yet.</p>}
              <h2>Topic weakness report (anonymous — screenshot this)</h2>
              {weakness.length ? <ul>{weakness.map((w, i) => <li key={i}>{w.topic}: {w.accuracy}% correct ({w.correct} right, {w.wrong} wrong)</li>)}</ul> : <p>No quiz data yet.</p>}
              <p className="small">This report names topics only, never individual pupils beyond nicknames on the leaderboard.</p>
            </>
          )}
          <h2>Your year in review</h2>
          <ul>{history.map((h, i) => <li key={i}>{h.month}: {h.scenario} — {h.choice}</li>)}</ul>
          <button className="btn primary big" onClick={() => { setScreen('onboarding'); setTurn(0); }}>Play again ↻</button>
          <p className="small">Better technology. Clearer futures. — Harmony Digital Consults Ltd</p>
        </main>
      )}
      <footer>Climate Action School · Harmony Digital Consults Ltd · Plays offline with the built-in storybook when AI is unavailable.</footer>
    </div>
  );
}
