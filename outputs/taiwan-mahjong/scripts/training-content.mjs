import fs from 'node:fs';
import { createHash } from 'node:crypto';

export const trainingSkills = [
  { id: 'efficiency', label: '牌效', goal: '先比較是否更接近聽牌，再比較依可見牌計的有效進牌。', limit: '本題目標是局部牌效；進牌張數不是實際摸中率，也未計放槍與收益。' },
  { id: 'claim-cost', label: '吃碰取捨', goal: '先確認合法吃碰與吃後可打的牌，再比較牌效和門清代價。', limit: '可以吃碰不等於值得吃碰；題目給定的條件不能推成整局最佳策略。' },
  { id: 'safety-scope', label: '安全牌', goal: '分辨公開資訊能證明的安全範圍，以及仍未知的放槍路徑。', limit: '只討論指定打牌的普通放槍；不能推成整局零風險或實際放槍百分比。' },
  { id: 'dealer-continuation', label: '莊家連莊', goal: '區分不放槍與阻止連莊，確認不同結果如何影響下一局莊家。', limit: '續莊規則與安全證據不是阻莊成功率，也不代表唯一策略。' },
];

const banks = ['TRAINING-DRAFTS.json', 'TRAINING-REVIEW-CANDIDATES.json']
  .map(file => JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')));
if (banks.some(bank => bank.rulesVersion !== 'TW16-CLASSIC-v1' || !Array.isArray(bank.cases))) throw Error('Unsupported training bank');
export const sourceQuestions = banks.flatMap(bank => bank.cases).filter(q => q.purpose === 'training');
// ponytail: this reviewed nine-question pack is a fixed allowlist; expansion requires content/family review and export compatibility first.
const publishedIds = ['E01', 'E02', 'S01', 'S02', 'C01', 'C02', 'D01', 'D02', 'C03'];
if (sourceQuestions.length !== publishedIds.length || new Set(sourceQuestions.map(q => q.id)).size !== publishedIds.length
  || sourceQuestions.some(q => !publishedIds.includes(q.id) || q.reviewStatus !== 'model-reviewed-not-calibrated'
    || !trainingSkills.some(s => s.id === q.skill) || typeof q.scope !== 'string' || !q.scope.trim())) throw Error('Training content requires review');

export const trainingQuestions = sourceQuestions.map(({ id, skill, scope, prompt, choices, accepted, derivation, board = [] }) => ({ id, skill, scope, prompt, choices, accepted, derivation, board }));
// Guidance and per-question scope are displayed context; changes must also invalidate automatic comparison of historical exports.
export const trainingContentRevision = createHash('sha256').update(JSON.stringify({ skills: trainingSkills, questions: trainingQuestions })).digest('hex');
