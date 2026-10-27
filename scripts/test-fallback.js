// Self-test for the fallback path: runs with NO Anthropic key set.
// Usage: node scripts/test-fallback.js
const assert = require('assert');
process.env.ANTHROPIC_API_KEY = '';
const lib = require('../api/_lib.cjs');

(async () => {
  const { SCENARIOS } = await import('../client/src/data/scenarios.js');
  // Fallback content shape
  assert.ok(lib.fallback.narrations.length >= 30, 'need 30+ narrations');
  assert.ok(lib.fallback.questions.length >= 60, 'need 60+ questions');
  assert.ok(SCENARIOS.length >= 30, 'need 30+ scenarios');
  const ids = new Set(SCENARIOS.map((s) => s.id));
  lib.fallback.narrations.forEach((n) => assert.ok(ids.has(n.scenarioId), 'narration for unknown scenario ' + n.scenarioId));
  lib.fallback.questions.forEach((q) => {
    assert.strictEqual(q.options.length, 4, 'quiz options must be 4');
    assert.ok(q.answer >= 0 && q.answer <= 3, 'quiz answer out of range');
    assert.ok(q.explanation.includes('.') || q.explanation.includes('!'), 'explanation should be a sentence');
  });
  // AI calls with no key must fall back, not throw
  const nar = await lib.narrate({ scenarioId: 's01', scenarioTitle: 'Test', scenarioContext: 'x', choiceLabel: 'y', consequence: 'z', ageBand: '8-11' });
  assert.strictEqual(nar.source, 'fallback');
  assert.ok(nar.text.split(/\s+/).length <= 80, 'narration over 80 words');
  const quiz = await lib.quiz({ ageBand: '12-14', topics: [] });
  assert.strictEqual(quiz.source, 'fallback');
  assert.strictEqual(quiz.questions.length, 10);
  const hint = await lib.hint({ scenarioTitle: 'Test', optionLabel: 'y', ageBand: '15-17' });
  assert.strictEqual(hint.source, 'fallback');
  // Defensive validation rejects bad AI-shaped output
  assert.throws(() => lib.validateNarration({ text: 'short', tip: 'x' }));
  assert.throws(() => lib.validateQuiz({ questions: [{ question: 'q', options: ['a'], answer: 0, explanation: 'e.' }] }));
  console.log('Fallback self-test PASSED: scenarios=' + SCENARIOS.length + ' narrations=' + lib.fallback.narrations.length + ' questions=' + lib.fallback.questions.length);
})().catch((e) => { console.error('Fallback self-test FAILED:', e); process.exit(1); });
