import { FoodCategory, FoodItem, PlateEvaluation } from '../types/game';

export const HEALTHY_CORE_CATEGORIES: FoodCategory[] = [
  'vegetables',
  'fruits',
  'grains',
  'proteins',
  'dairy',
];

export const CATEGORY_NAMES_AR: Record<FoodCategory, string> = {
  vegetables: 'الخضروات',
  fruits: 'الفواكه',
  grains: 'الحبوب والنشويات',
  proteins: 'البروتينات',
  dairy: 'الألبان',
  junk: 'أطعمة غير صحية',
};

/**
 * Calculates plate diversity score and bonus
 */
export function calculateDiversityBonus(distinctCount: number): number {
  switch (distinctCount) {
    case 5:
      return 70; // Perfect balance covering all 5 groups!
    case 4:
      return 45; // Great balance
    case 3:
      return 30; // Good start
    case 2:
      return 15; // Moderate
    default:
      return 0; // 0 or 1 group - needs diversity
  }
}

/**
 * Evaluates the full contents of a plate for a team turn
 */
export function evaluatePlate(
  items: FoodItem[],
  remainingTimeSeconds: number = 0,
  isUntimed: boolean = false
): PlateEvaluation {
  if (!items || items.length === 0) {
    return {
      items: [],
      itemCount: 0,
      distinctGroupsCount: 0,
      distinctGroups: [],
      basePoints: 0,
      diversityBonus: 0,
      speedBonus: 0,
      penalties: 0,
      totalRoundScore: 0,
      feedbackText: 'الطبق فارغ تماماً! لم يتم اختيار أي أطعمة في هذه الجولة.',
      healthGrade: 'غير متوازن',
      hasJunk: false,
      junkCount: 0,
    };
  }

  // 1. Identify distinct healthy groups
  const presentCategories = new Set<FoodCategory>();
  let basePoints = 0;
  let junkCount = 0;

  for (const item of items) {
    if (item.category === 'junk' || !item.isHealthy) {
      junkCount++;
    } else {
      presentCategories.add(item.category);
      basePoints += item.basePoints;
    }
  }

  const distinctGroups = Array.from(presentCategories);
  const distinctGroupsCount = distinctGroups.length;

  // 2. Diversity bonus
  const diversityBonus = calculateDiversityBonus(distinctGroupsCount);

  // 3. Penalties: 20 points deduction per junk item
  const penalties = junkCount * 20;

  // 4. Speed bonus: only if plate has >= 3 items and NO junk
  let speedBonus = 0;
  if (!isUntimed && remainingTimeSeconds > 0 && junkCount === 0 && items.length >= 3) {
    speedBonus = Math.min(25, Math.floor(remainingTimeSeconds / 2));
  }

  // 5. Total calculation with non-negative guarantee
  const rawScore = basePoints + diversityBonus + speedBonus - penalties;
  const totalRoundScore = Math.max(0, rawScore);

  // 6. Determine grade and constructive educational feedback
  const hasJunk = junkCount > 0;
  let healthGrade: PlateEvaluation['healthGrade'] = 'غير متوازن';
  let feedbackText = '';

  const missingGroups = HEALTHY_CORE_CATEGORIES.filter(
    (cat) => !presentCategories.has(cat)
  ).map((cat) => CATEGORY_NAMES_AR[cat]);

  if (hasJunk) {
    healthGrade = 'غير متوازن';
    feedbackText = `يحتوي الطبق على ${junkCount} من الأطعمة غير الصحية (خصم ${penalties} نقطة). احرص على استبدال المقليات والحلويات ببدائل طبيعية مغذية!`;
  } else if (distinctGroupsCount === 5) {
    healthGrade = 'ممتاز';
    feedbackText =
      'إنجاز مذهل! طبق صحي متكامل يغطي جميع المجموعات الغذائية الخمس الأساسية ويوفر توازناً غذائياً مثالياً للجسم.';
  } else if (distinctGroupsCount >= 3) {
    healthGrade = 'جيد جداً';
    feedbackText = `طبق صحي ممتاز يحتوي على ${distinctGroupsCount} مجموعات غذائية متنوعة. لجعل الطبق نموذجياً، أضف حصة من: ${missingGroups.slice(0, 2).join(' و ')}.`;
  } else if (distinctGroupsCount >= 1) {
    healthGrade = 'مقبول';
    feedbackText = `بداية طيبة، لكن الطبق ينقصه التنوع الغذائي المتوازن. ينصح بإضافة: ${missingGroups.slice(0, 3).join('، ')}.`;
  }

  return {
    items: [...items],
    itemCount: items.length,
    distinctGroupsCount,
    distinctGroups,
    basePoints,
    diversityBonus,
    speedBonus,
    penalties,
    totalRoundScore,
    feedbackText,
    healthGrade,
    hasJunk,
    junkCount,
  };
}
