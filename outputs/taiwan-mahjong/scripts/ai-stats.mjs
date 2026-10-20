// 正式電腦策略坐滿四家的固定種子對局統計，用於比較策略調整前後的叫牌頻率與結局分布。
// 用法：npm run stats:ai -- [將數，預設 4] [起始種子，預設 1000]
// 只讀 dist（npm run check 產生），不碰瀏覽器存檔。數字是本機電腦互打結果，不代表真人牌局。
import { createGame, legalActions, applyAction, getObservation, serialize, restore } from '../dist/engine.js';
import { chooseAction } from '../dist/ai.js';

const matches = Number(process.argv[2] ?? 4), firstSeed = Number(process.argv[3] ?? 1000);
if (!Number.isInteger(matches) || matches < 1 || !Number.isInteger(firstSeed) || firstSeed < 1) throw new Error('用法：ai-stats.mjs [將數>=1] [起始種子>=1]');

const calls = { CHI: 0, PON: 0, KAN_OPEN: 0, KAN_ADDED: 0, KAN_CLOSED: 0 };
const outcomes = {}, tai = [];
let hands = 0, decisions = 0, decisionMs = 0, transitions = 0;

for (let m = 0; m < matches; m++) {
  let s = createGame({ seed: firstSeed + m, dealer: 0, matchId: `ai-stats-${firstSeed + m}` });
  const random = [1, 2, 3, 4].map(n => (firstSeed + m) * 4 + n);
  while (s.phase !== 'matchResult') {
    if (++transitions > 5_000_000) throw new Error('STATS_TRANSITION_LIMIT');
    let actor = 'engine', intent = legalActions(s, 'engine')[0];
    if (!intent) {
      const seat = [0, 1, 2, 3].find(x => legalActions(s, x).length);
      if (seat === undefined) throw new Error(`STUCK ${s.matchId} ${s.handId} ${s.phase}`);
      const o = getObservation(s, seat), start = performance.now();
      const decision = chooseAction(o, o.legalActions, random[seat]);
      decisionMs += performance.now() - start; decisions++;
      random[seat] = decision.randomState; actor = seat; intent = decision.intent;
    }
    if (intent.type in calls) calls[intent.type]++;
    const result = applyAction(s, { opId: `${s.handId}:${s.version}:${actor}`, matchId: s.matchId, handId: s.handId, version: s.version, actor, intent });
    if (!result.ok) throw new Error(`${result.error} ${intent.type}`);
    s = result.state;
    if (transitions % 997 === 0) s = restore(serialize(s)); // 抽查中途存讀檔不改變後續流程。
    if (s.phase === 'handResult') {
      hands++;
      const st = s.settlement;
      if (st.delta.reduce((a, b) => a + b, 0) !== 0) throw new Error('UNBALANCED_SETTLEMENT');
      outcomes[st.source] = (outcomes[st.source] ?? 0) + 1;
      if (st.score) tai.push(st.score.tai);
    }
  }
}

const share = n => Number((n / hands).toFixed(3));
const allCalls = calls.CHI + calls.PON + calls.KAN_OPEN;
console.log(JSON.stringify({
  seeds: [firstSeed, firstSeed + matches - 1], matches, hands,
  outcomeShare: Object.fromEntries(Object.entries(outcomes).sort().map(([k, n]) => [k, share(n)])),
  callsPerHand: { chiPonOpenKong: share(allCalls), chi: share(calls.CHI), pon: share(calls.PON), kong: share(calls.KAN_OPEN + calls.KAN_ADDED + calls.KAN_CLOSED) },
  winTai: { mean: Number((tai.reduce((a, b) => a + b, 0) / tai.length).toFixed(2)), max: Math.max(...tai), zeroShare: Number((tai.filter(n => n === 0).length / tai.length).toFixed(3)) },
  aiDecisionMsMean: Number((decisionMs / decisions).toFixed(2)),
}, null, 2));
