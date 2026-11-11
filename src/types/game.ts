export type FoodCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'proteins'
  | 'dairy'
  | 'junk';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  isHealthy: boolean;
  benefit: string;
  categoryLabelAr: string;
  basePoints: number;
}

export interface Team {
  id: 'team1' | 'team2';
  name: string;
  color: 'emerald' | 'amber';
  score: number;
  roundsWon: number;
}

export interface PlateEvaluation {
  items: FoodItem[];
  itemCount: number;
  distinctGroupsCount: number;
  distinctGroups: FoodCategory[];
  basePoints: number;
  diversityBonus: number;
  speedBonus: number;
  penalties: number;
  totalRoundScore: number;
  feedbackText: string;
  healthGrade: 'ممتاز' | 'جيد جداً' | 'مقبول' | 'غير متوازن';
  hasJunk: boolean;
  junkCount: number;
}

export interface RoundResult {
  roundNumber: number;
  isTieBreaker?: boolean;
  team1Evaluation: PlateEvaluation;
  team2Evaluation: PlateEvaluation;
  winner: 'team1' | 'team2' | 'tie';
}

export interface GameConfig {
  totalRounds: number;
  roundDurationSeconds: number; // 0 for untimed
  maxPlateItems: number;
  soundEnabled: boolean;
}

export type GamePhase =
  | 'setup'
  | 'turn_ready'
  | 'turn_active'
  | 'round_evaluated'
  | 'game_over'
  | 'tie_breaker';
