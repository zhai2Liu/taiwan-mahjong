import test from 'node:test';
import assert from 'node:assert/strict';
import { getObservation } from '../dist/engine.js';
import { captureDecision } from '../dist/decision-snapshot.js';
import { claimResolution, buildDecisionReview, buildHandReview } from '../dist/hand-review.js';
import { reviewClaimText, reviewPracticeSkills } from '../dist/hand-review-view.js';
import { fixture, discard, resolve, run, W02 } from './fixtures.mjs';

const chiHand = '1345m67m123p456p789s1z';
const offer = (hands = {}) => discard(fixture({ turn: 3, hands: { 0: chiHand, 3: '2m', ...hands } }), 3, '2m');
const snapshot = (state, type) => {
  const o = getObservation(state, 0), chosen = o.legalActions.find(a => a.type === type);
  assert.ok(chosen); return captureDecision(o, chosen, 'TW16-CLASSIC-v1');
};

test('吃牌送出仍pending，仲裁成立才顯示取得；結果不影響原牌效證據', () => {
  const state = offer(), s = snapshot(state, 'CHI'), original = structuredClone(s);
  const submitted = run(state, 0, 'CHI');
  assert.deepEqual(claimResolution(s, getObservation(submitted, 0)), { status: 'pending' });
  const ended = resolve(submitted), after = getObservation(ended, 0);
  assert.deepEqual(claimResolution(s, after), { status: 'resolved', seat: 0, action: 'chi', finished: false });
  const beforeCard = buildDecisionReview(s).cards[0], afterCard = buildDecisionReview(s, after).cards[0];
  assert.deepEqual(afterCard.evidence, beforeCard.evidence); assert.deepEqual(afterCard.rows, beforeCard.rows);
  assert.match(reviewClaimText(afterCard), /你吃牌成立.*已取得/);
  assert.deepEqual(s, original);
  const alternative = s.observation.legalActions.find(a => a.type === 'CHI' && a.ownTiles.some(t => t.startsWith('4m')));
  const different = resolve(state, { 0: a => JSON.stringify(a) === JSON.stringify(alternative) });
  assert.deepEqual(claimResolution(s, getObservation(different, 0)), { status: 'unavailable' }, '同一事件吃了另一組，不能說原吃法取得');
});

test('吃被碰或胡截走，顯示真正仲裁座位；局後用同局公開牌核對', () => {
  for (const [hand, response, expectedAction] of [['22m123s456s789p11z34p7p', 'PON', 'pon'], [W02, 'WIN', 'win']]) {
    const state = offer({ 1: hand }), s = snapshot(state, 'CHI');
    const ended = resolve(state, { 0: 'CHI', 1: response }), after = getObservation(ended, 0);
    const result = claimResolution(s, after);
    assert.equal(result.status, 'resolved'); assert.equal(result.seat, 1); assert.equal(result.action, expectedAction);
    assert.equal(result.finished, response === 'WIN');
    const card = buildHandReview([s], s.observation.matchId, s.observation.handId, 0, after).cards[0];
    assert.match(reviewClaimText(card), /下家.*成立.*未取得/);
    assert.equal(card.snapshot.chosen.type, 'CHI');
    assert.deepEqual(card.evidence, buildDecisionReview(s).cards[0].evidence);
  }
});

test('碰成立與選過全過分開；缺來源／他局／舊版本不補造取得結果', () => {
  const state = discard(fixture({ turn: 3, hands: { 0: '22s123m456m123p11z347s', 3: '2s' } }), 3, '2s');
  const s = snapshot(state, 'PON');
  assert.equal(claimResolution(s, getObservation(resolve(state, { 0: 'PON' }), 0)).action, 'pon');
  const pass = snapshot(state, 'PASS'), after = getObservation(resolve(state), 0);
  assert.deepEqual(claimResolution(pass, after), { status: 'resolved', seat: null, action: null, finished: false });
  assert.match(reviewClaimText(buildDecisionReview(pass, after).cards[0]), /各家過.*沒有被取走/);
  assert.deepEqual(claimResolution(s), { status: 'unavailable' });
  for (const change of [o => o.matchId = 'foreign', o => o.handId++, o => o.seat = 1, o => o.version = s.observation.version,
    o => o.players[3].discardHistory[0].eventSeq++, o => o.players[3].discardHistory = []]) {
    const foreign = structuredClone(after); change(foreign);
    assert.deepEqual(claimResolution(s, foreign), { status: 'unavailable' });
  }
  // A chosen claim paired with an all-pass result is inconsistent, never proof of acquisition.
  assert.deepEqual(claimResolution(s, after), { status: 'unavailable' });
});

test('同類練習是小型能力對照，不依仲裁輸贏或改動原候選', () => {
  const s = snapshot(offer(), 'PASS'), card = buildDecisionReview(s).cards[0];
  assert.deepEqual(reviewPracticeSkills(card), ['claim-cost']);
  const o = getObservation(fixture({ streak: 2 }), 0), d = captureDecision(o, o.legalActions.find(a => a.type === 'DISCARD'), 'TW16-CLASSIC-v1');
  const dc = buildDecisionReview(d).cards[0];
  assert.equal(claimResolution(d), null);
  assert.deepEqual(reviewPracticeSkills(dc), ['efficiency', 'safety-scope', 'dealer-continuation']);
});
