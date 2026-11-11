import { FOOD_DATABASE } from '../data/foodItems';
import {
  calculateDiversityBonus,
  evaluatePlate,
  HEALTHY_CORE_CATEGORIES,
} from '../utils/nutritionScoring';
import { FoodItem, Team, RoundResult } from '../types/game';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`✅ [PASS] ${name}`);
  } else {
    results.push({ name, passed: false, details });
    console.error(`❌ [FAIL] ${name}: ${details}`);
  }
}

console.log('=== بدء الفحص البرمجي الشامل لقواعد تحدي الطبق الصحي ===\n');

// 1. اختبار حساب مكافأة التنوع (Diversity Bonus)
assert(
  calculateDiversityBonus(0) === 0,
  'مكافأة 0 مجموعات تساوي 0',
  'يجب أن تكون المكافأة 0'
);
assert(
  calculateDiversityBonus(1) === 0,
  'مكافأة مجموعة واحدة تساوي 0 لعدم التنوع',
  'المجموعة الواحدة لا تستحق مكافأة تنوع'
);
assert(
  calculateDiversityBonus(2) === 15,
  'مكافأة مجموعتين تساوي 15 نقطة',
  `القيمة المتوقعة 15، الفعلي: ${calculateDiversityBonus(2)}`
);
assert(
  calculateDiversityBonus(3) === 30,
  'مكافأة 3 مجموعات تساوي 30 نقطة',
  `القيمة المتوقعة 30، الفعلي: ${calculateDiversityBonus(3)}`
);
assert(
  calculateDiversityBonus(4) === 45,
  'مكافأة 4 مجموعات تساوي 45 نقطة',
  `القيمة المتوقعة 45، الفعلي: ${calculateDiversityBonus(4)}`
);
assert(
  calculateDiversityBonus(5) === 70,
  'مكافأة الطبق الكامل (5 مجموعات) تساوي 70 نقطة',
  `القيمة المتوقعة 70، الفعلي: ${calculateDiversityBonus(5)}`
);

// 2. اختبار تقييم طبق صحي متكامل (5 مجموعات) مع مكافأة السرعة
const broccoli = FOOD_DATABASE.find((f) => f.id === 'veg_broccoli')!;
const apple = FOOD_DATABASE.find((f) => f.id === 'fruit_apple')!;
const rice = FOOD_DATABASE.find((f) => f.id === 'grain_brown_rice')!;
const fish = FOOD_DATABASE.find((f) => f.id === 'prot_grilled_fish')!;
const milk = FOOD_DATABASE.find((f) => f.id === 'dairy_milk')!;

const perfectPlate: FoodItem[] = [broccoli, apple, rice, fish, milk];
const baseExpected =
  broccoli.basePoints + apple.basePoints + rice.basePoints + fish.basePoints + milk.basePoints;
// 12 + 12 + 14 + 16 + 14 = 68
const evalPerfect = evaluatePlate(perfectPlate, 20, false);

assert(
  evalPerfect.basePoints === baseExpected,
  'حساب النقاط الأساسية للطبق الكامل بدقة (68 نقطة)',
  `المتوقع ${baseExpected}، الفعلي ${evalPerfect.basePoints}`
);
assert(
  evalPerfect.distinctGroupsCount === 5,
  'احتساب 5 مجموعات غذائية مختلفة للطبق المتكامل',
  `المتوقع 5، الفعلي ${evalPerfect.distinctGroupsCount}`
);
assert(
  evalPerfect.diversityBonus === 70,
  'حصول الطبق المتكامل على مكافأة التنوع القصوى (70 نقطة)',
  `المتوقع 70، الفعلي ${evalPerfect.diversityBonus}`
);
assert(
  evalPerfect.speedBonus === 10,
  'حساب مكافأة السرعة (20 ثانية متبقية / 2 = 10 نقاط)',
  `المتوقع 10، الفعلي ${evalPerfect.speedBonus}`
);
assert(
  evalPerfect.penalties === 0,
  'عدم وجود أي خصومات على الطبق الصحي الخالي من الأطعمة الضارة',
  `المتوقع 0، الفعلي ${evalPerfect.penalties}`
);
assert(
  evalPerfect.totalRoundScore === baseExpected + 70 + 10,
  `إجمالي نقاط الطبق الكامل صحيح (${baseExpected + 70 + 10} نقطة)`,
  `المتوقع ${baseExpected + 70 + 10}، الفعلي ${evalPerfect.totalRoundScore}`
);
assert(
  evalPerfect.healthGrade === 'ممتاز',
  'التقدير الصحي للطبق الكامل هو "ممتاز"',
  `الفعلي: ${evalPerfect.healthGrade}`
);

// 3. اختبار خصم الأطعمة غير الصحية وحرمانها من مكافأة السرعة
const soda = FOOD_DATABASE.find((f) => f.id === 'junk_soda')!;
const chips = FOOD_DATABASE.find((f) => f.id === 'junk_chips')!;
const junkPlate: FoodItem[] = [broccoli, apple, soda, chips];

const evalJunk = evaluatePlate(junkPlate, 30, false);
// Base points from broccoli (12) + apple (12) = 24
// Distinct healthy groups: vegetables, fruits = 2 -> bonus = 15
// Junk penalties: 2 * 20 = 40
// Speed bonus should be 0 because plate contains junk
// Total: 24 + 15 + 0 - 40 = -1 -> clamped to 0
assert(
  evalJunk.penalties === 40,
  'تطبيق خصم 20 نقطة لكل صنف غير صحي (40 نقطة لـ 2 صنف)',
  `المتوقع 40، الفعلي ${evalJunk.penalties}`
);
assert(
  evalJunk.speedBonus === 0,
  'حرمان الطبق الذي يحتوي على أطعمة غير صحية من مكافأة السرعة',
  `المتوقع 0، الفعلي ${evalJunk.speedBonus}`
);
assert(
  evalJunk.totalRoundScore === 0,
  'عدم هبوط مجموع النقاط تحت الصفر (Clamping to 0)',
  `المتوقع 0، الفعلي ${evalJunk.totalRoundScore}`
);
assert(
  evalJunk.healthGrade === 'غير متوازن',
  'تصنيف الطبق المحتوي على أطعمة ضارة كـ "غير متوازن"',
  `الفعلي: ${evalJunk.healthGrade}`
);

// 4. اختبار الطبق الفارغ
const evalEmpty = evaluatePlate([], 40, false);
assert(evalEmpty.totalRoundScore === 0, 'الطبق الفارغ يحصل على 0 نقطة', '');
assert(evalEmpty.itemCount === 0, 'الطبق الفارغ عدد عناصره 0', '');

// 5. اختبار حماية منع احتساب الجولة أكثر من مرة (Idempotency Simulation)
class GameScoringEngine {
  team1: Team = { id: 'team1', name: 'الأبطال', color: 'emerald', score: 0, roundsWon: 0 };
  team2: Team = { id: 'team2', name: 'النجوم', color: 'amber', score: 0, roundsWon: 0 };
  history: RoundResult[] = [];
  evaluatedRounds = new Set<number>();

  commitRound(roundNum: number, eval1: typeof evalPerfect, eval2: typeof evalJunk): boolean {
    // Idempotency guard:
    if (this.evaluatedRounds.has(roundNum)) {
      console.warn(`[Guard] منع إعادة احتساب الجولة ${roundNum} المكتملة مسبقاً!`);
      return false; // rejected, already committed
    }

    this.evaluatedRounds.add(roundNum);
    this.team1.score += eval1.totalRoundScore;
    this.team2.score += eval2.totalRoundScore;

    let winner: 'team1' | 'team2' | 'tie' = 'tie';
    if (eval1.totalRoundScore > eval2.totalRoundScore) {
      winner = 'team1';
      this.team1.roundsWon++;
    } else if (eval2.totalRoundScore > eval1.totalRoundScore) {
      winner = 'team2';
      this.team2.roundsWon++;
    }

    this.history.push({
      roundNumber: roundNum,
      team1Evaluation: eval1,
      team2Evaluation: eval2,
      winner,
    });
    return true;
  }
}

const engine = new GameScoringEngine();
const firstCommit = engine.commitRound(1, evalPerfect, evalJunk);
const secondCommit = engine.commitRound(1, evalPerfect, evalJunk); // Duplicate attempt!

assert(firstCommit === true, 'احتساب الجولة الأولى بنجاح في المرة الأولى', '');
assert(secondCommit === false, 'حظر احتساب نفس الجولة للمرة الثانية (منع التكرار)', '');
assert(
  engine.team1.score === evalPerfect.totalRoundScore,
  'نقاط الفريق لم تتضاعف بعد محاولة الضغط المكررة',
  `نقاط الفريق: ${engine.team1.score}، المتوقع: ${evalPerfect.totalRoundScore}`
);
assert(
  engine.history.length === 1,
  'سجل الجولات يحتوي على جولة واحدة فقط دون تكرار',
  `طول السجل: ${engine.history.length}`
);

// 6. اختبار كشف التعادل (Tie Handling)
const tiedEngine = new GameScoringEngine();
// Commit 2 rounds with identical scores
tiedEngine.commitRound(1, evalJunk, evalJunk);
tiedEngine.commitRound(2, evalJunk, evalJunk);
const isTie = tiedEngine.team1.score === tiedEngine.team2.score;
assert(isTie === true, 'كشف حالة تعادل الفريقين عند تساوي مجموع النقاط بدقة', '');

// 7. اختبار عدم فقدان النتائج والاحتفاظ بالتاريخ الكامل
assert(
  engine.history[0].team1Evaluation.items.length === 5 &&
    engine.history[0].team2Evaluation.items.length === 4,
  'الاحتفاظ بكافة تفاصيل وعناصر الجولة في السجل للشاشة النهائية',
  ''
);

const failed = results.filter((r) => !r.passed);
console.log('\n=======================================');
console.log(`إجمالي الاختبارات المنفذة: ${results.length}`);
console.log(`الناجحة: ${results.length - failed.length}`);
console.log(`الفاشلة: ${failed.length}`);
console.log('=======================================');

if (failed.length > 0) {
  process.exit(1);
} else {
  console.log('🎉 جميع سيناريوهات القواعد والنقاط والتنوع واجتياز التكرار اجتازت الاختبار بنسبة 100%!');
}
