import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fixture, discard, resolve } from './fixtures.mjs';
import { getObservation } from '../dist/engine.js';
import { coachAnalysis } from '../dist/coach.js';
import { analyzeObservation } from '../dist/analysis.js';
import { discardRiskEvidence } from '../dist/risk-evidence.js';
import { kindOf } from '../dist/tiles.js';

const read = name => JSON.parse(fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const original = read('TRAINING-DRAFTS.json'), bank = read('TRAINING-REVIEW-CANDIDATES.json');
const byId = id => bank.cases.find(c => c.id === id);
const sorted = a => [...a].sort();

test('候選題仍為草案：識別與答案完整，保留候選題族不可洩入訓練', () => {
  assert.equal(bank.status, 'draft-not-in-runtime');
  assert.equal(bank.rulesVersion, original.rulesVersion);
  const all = [...original.cases, ...bank.cases];
  assert.equal(new Set(all.map(c => c.id)).size, all.length);
  const trainingFamilies = new Set(all.filter(c => c.purpose === 'training').map(c => c.familyId));
  for (const c of bank.cases) {
    assert.equal(c.reviewStatus, 'pending-content-review');
    assert.ok(['training', 'assessment-candidate'].includes(c.purpose));
    if (c.purpose === 'assessment-candidate') assert.ok(!trainingFamilies.has(c.familyId));
    assert.equal(new Set(c.choices.map(x => x.id)).size, c.choices.length);
    assert.equal(new Set(c.accepted).size, c.accepted.length);
    assert.ok(c.accepted.length && c.accepted.every(id => c.choices.some(x => x.id === id)));
    for (const key of ['sufficient', 'partial', 'conflict']) assert.ok(c.reasonRubric[key].length);
    for (const ref of c.references) assert.ok(fs.existsSync(new URL(`../${ref}`, import.meta.url)), ref);
  }
  // ponytail: family IDs enforce declared isolation only; structural novelty and difficulty require content review.
  assert.deepEqual(original.assessmentFamilies, [], '候選不自動取得正式測驗資格');
});

test('C03手算碰5張／吃3張：兩路實際仲裁後可打7，成聽但失去門清', () => {
  const c = byId('C03');
  const state = discard(fixture({ turn: 3, hands: { 0: '22s123m456m123p11z347s', 3: '2s' } }), 3, '2s');
  const result = coachAnalysis(getObservation(state, 0));
  assert.equal(result.current.shanten, c.expected.beforeShanten);
  assert.equal(result.canWin, false);
  assert.deepEqual(result.claims.map(x => x.intent.type).sort(), ['CHI', 'PON']);
  for (const type of ['PON', 'CHI']) {
    const expected = c.expected[type.toLowerCase()];
    const claim = result.claims.find(x => x.intent.type === type);
    assert.equal(claim.losesClosed, c.expected.losesClosed);
    const seven = claim.discards.find(x => x.kind === expected.discard).analysis;
    assert.equal(seven.shanten, expected.shanten);
    assert.equal(seven.improving, expected.improving);
    assert.deepEqual(sorted(seven.effectiveTiles.map(t => t.kind)), sorted(expected.waits));
    const acquired = resolve(state, { 0: type });
    assert.equal(acquired.turn, 0);
    assert.equal(acquired.players[0].melds[0].kind, type.toLowerCase());
    assert.ok(getObservation(acquired, 0).legalActions.some(a => a.type === 'DISCARD' && kindOf(a.tileId) === '7s'));
    const after = discard(acquired, 0, '7s');
    assert.equal(after.players[0].concealed.length, 13);
  }
  assert.deepEqual(c.accepted, ['both-ready', 'pon-more', 'closed-cost']);
});

test('HE01已公開第四張使未知池歸零，卻仍可胡當次捨牌；過水反例另驗', () => {
  const c = byId('HE01');
  for (const passedWin of [false, true]) {
    const s = discard(fixture({ turn: 1,
      hands: { 0: '111m222m333p444p555s1z', 1: '1z' },
      restrictions: { 0: { passedWin }, 2: { lastDiscard: '1z' }, 3: { lastDiscard: '1z' } },
    }), 1, '1z');
    const a = analyzeObservation(getObservation(s, 0), false);
    assert.equal(a.current.shanten, c.expected.shanten);
    assert.equal(a.current.improving, c.expected.improving);
    assert.deepEqual(a.current.effectiveTiles, [{ kind: '1z', count: 0 }]);
    assert.equal(a.canWin, passedWin ? false : c.expected.canWin);
    if (!passedWin) assert.equal(resolve(s, { 0: 'WIN' }).settlement.winner, 0);
  }
  assert.deepEqual(c.accepted, ['ready', 'zero-unseen', 'can-win']);
});

test('HS01五組只差將的容量證明不擴張到未副露兩家', () => {
  const c = byId('HS01');
  const s = fixture({ hands: { 0: '3333m123p456p789s11z23s', 1: '1m' },
    melds: { 1: ['111p', '222p', '333p', '444s', '555s'].map(tiles => ({ tiles })) },
  });
  const a = discardRiskEvidence(getObservation(s, 0)).candidates.find(x => x.kind === c.expected.kind);
  assert.deepEqual(a.opponents.filter(p => p.provenSafe).map(p => p.seat), c.expected.safeSeats);
  assert.deepEqual(a.opponents.filter(p => !p.provenSafe).map(p => p.seat), c.expected.unknownSeats);
  assert.equal(a.provenSafeAgainstAll, c.expected.provenSafeAgainstAll);
  assert.ok(a.opponents.filter(p => p.seat !== 1).every(p => p.possibleUses.some(u => u.type === 'sequence')));
  assert.deepEqual(c.accepted, ['one-safe', 'others-unknown']);
});
