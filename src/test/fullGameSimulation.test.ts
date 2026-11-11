import { FOOD_DATABASE } from '../data/foodItems';
import { evaluatePlate } from '../utils/nutritionScoring';
import { Team, RoundResult } from '../types/game';

console.log('=== محاكاة دورة لعبة كاملة من البداية إلى النهاية (Full Game E2E Simulation) ===\n');

// Initialize teams
const team1: Team = {
  id: 'team1',
  name: 'فريق الأبطال',
  color: 'emerald',
  score: 0,
  roundsWon: 0,
};

const team2: Team = {
  id: 'team2',
  name: 'فريق النجوم',
  color: 'amber',
  score: 0,
  roundsWon: 0,
};

const history: RoundResult[] = [];
const committedRounds = new Set<string>();

function commitTurn(
  roundNum: number,
  teamId: 'team1' | 'team2',
  plate: typeof FOOD_DATABASE,
  remainingSeconds: number
) {
  const turnKey = `r${roundNum}_${teamId}`;
  if (committedRounds.has(turnKey)) {
    throw new Error(`خطأ: تم احتساب دور ${turnKey} أكثر من مرة!`);
  }
  committedRounds.add(turnKey);

  const evaluation = evaluatePlate(plate, remainingSeconds, false);
  const targetTeam = teamId === 'team1' ? team1 : team2;
  targetTeam.score += evaluation.totalRoundScore;
  return evaluation;
}

function finalizeRound(roundNum: number, isTieBreaker: boolean, eval1: any, eval2: any) {
  let winner: 'team1' | 'team2' | 'tie' = 'tie';
  if (eval1.totalRoundScore > eval2.totalRoundScore) {
    winner = 'team1';
    team1.roundsWon++;
  } else if (eval2.totalRoundScore > eval1.totalRoundScore) {
    winner = 'team2';
    team2.roundsWon++;
  }

  history.push({
    roundNumber: roundNum,
    isTieBreaker,
    team1Evaluation: eval1,
    team2Evaluation: eval2,
    winner,
  });
}

// Round 1
console.log('--- الجولة 1 ---');
// Team 1 picks 5 balanced foods: broccoli, apple, brown rice, salmon, milk
const veg = FOOD_DATABASE.find((f) => f.id === 'veg_broccoli')!;
const fruit = FOOD_DATABASE.find((f) => f.id === 'fruit_apple')!;
const grain = FOOD_DATABASE.find((f) => f.id === 'grain_brown_rice')!;
const prot = FOOD_DATABASE.find((f) => f.id === 'prot_grilled_fish')!;
const dairy = FOOD_DATABASE.find((f) => f.id === 'dairy_milk')!;

const t1_r1_eval = commitTurn(1, 'team1', [veg, fruit, grain, prot, dairy], 25);
console.log(`فريق 1: ${t1_r1_eval.totalRoundScore} نقطة (تقدير: ${t1_r1_eval.healthGrade}, تنوع: ${t1_r1_eval.distinctGroupsCount}/5)`);

// Team 2 picks: carrot, dates, oats, plus a soda (junk!)
const carrot = FOOD_DATABASE.find((f) => f.id === 'veg_carrot')!;
const dates = FOOD_DATABASE.find((f) => f.id === 'fruit_dates')!;
const oats = FOOD_DATABASE.find((f) => f.id === 'grain_oats')!;
const soda = FOOD_DATABASE.find((f) => f.id === 'junk_soda')!;

const t2_r1_eval = commitTurn(1, 'team2', [carrot, dates, oats, soda], 15);
console.log(`فريق 2: ${t2_r1_eval.totalRoundScore} نقطة (تقدير: ${t2_r1_eval.healthGrade}, خصم: ${t2_r1_eval.penalties})`);

finalizeRound(1, false, t1_r1_eval, t2_r1_eval);
console.log(`الفائز بالجولة 1: ${history[0].winner === 'team1' ? team1.name : team2.name}`);

// Round 2
console.log('\n--- الجولة 2 ---');
// Team 1 picks: chicken, yogurt, strawberry, cucumber, whole bread (5 groups!)
const chicken = FOOD_DATABASE.find((f) => f.id === 'prot_grilled_chicken')!;
const yogurt = FOOD_DATABASE.find((f) => f.id === 'dairy_yogurt')!;
const straw = FOOD_DATABASE.find((f) => f.id === 'fruit_strawberry')!;
const cuc = FOOD_DATABASE.find((f) => f.id === 'veg_cucumber')!;
const bread = FOOD_DATABASE.find((f) => f.id === 'grain_whole_bread')!;

const t1_r2_eval = commitTurn(2, 'team1', [chicken, yogurt, straw, cuc, bread], 18);
console.log(`فريق 1: ${t1_r2_eval.totalRoundScore} نقطة (تنوع: ${t1_r2_eval.distinctGroupsCount}/5)`);

// Team 2 learns and picks 5 healthy items as well: eggs, cottage cheese, tomato, orange, baked potato
const eggs = FOOD_DATABASE.find((f) => f.id === 'prot_boiled_eggs')!;
const cheese = FOOD_DATABASE.find((f) => f.id === 'dairy_cottage_cheese')!;
const tomato = FOOD_DATABASE.find((f) => f.id === 'veg_tomato')!;
const orange = FOOD_DATABASE.find((f) => f.id === 'fruit_orange')!;
const potato = FOOD_DATABASE.find((f) => f.id === 'grain_baked_potato')!;

const t2_r2_eval = commitTurn(2, 'team2', [eggs, cheese, tomato, orange, potato], 30);
console.log(`فريق 2: ${t2_r2_eval.totalRoundScore} نقطة (تنوع: ${t2_r2_eval.distinctGroupsCount}/5)`);

finalizeRound(2, false, t1_r2_eval, t2_r2_eval);

// Round 3
console.log('\n--- الجولة 3 ---');
const t1_r3_eval = commitTurn(3, 'team1', [veg, fruit, grain, prot], 10);
const t2_r3_eval = commitTurn(3, 'team2', [prot, dairy, grain, veg], 20);
finalizeRound(3, false, t1_r3_eval, t2_r3_eval);

console.log('\n--- النتائج الإجمالية بعد انتهاء الجولات الثلاث ---');
console.log(`${team1.name}: ${team1.score} نقطة (فاز بـ ${team1.roundsWon} جولات)`);
console.log(`${team2.name}: ${team2.score} نقطة (فاز بـ ${team2.roundsWon} جولات)`);
console.log(`عدد السجلات المحفوظة في التاريخ: ${history.length} من 3`);

if (history.length !== 3) {
  throw new Error('فقدان في سجلات الجولات!');
}

console.log('\n--- اختبار محاكاة جولة الحسم الفاصلة في حالة التعادل ---');
const isTie = team1.score === team2.score;
console.log(`حالة التعادل: ${isTie ? 'نعم (تتطلب جولة الحسم)' : 'فوز أحد الفريقين'}`);

console.log('✅ اكتملت محاكاة اللعبة كاملة بنجاح، وجميع السجلات محفوظة بدون أي تسريب أو تكرار!');
