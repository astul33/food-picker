import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Team,
  GameConfig,
  PlateEvaluation,
  RoundResult,
  FoodItem,
  GamePhase,
} from './types/game';
import { evaluatePlate } from './utils/nutritionScoring';
import { sounds } from './utils/soundEffects';
import { SmartboardHeader } from './components/SmartboardHeader';
import { ScoreBoard } from './components/ScoreBoard';
import { TimerBar } from './components/TimerBar';
import { PlateArea } from './components/PlateArea';
import { FoodShelf } from './components/FoodShelf';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { FinalPodiumModal } from './components/FinalPodiumModal';
import { GameSetupModal } from './components/GameSetupModal';

const DEFAULT_CONFIG: GameConfig = {
  totalRounds: 3,
  roundDurationSeconds: 45,
  maxPlateItems: 5,
  soundEnabled: true,
};

export default function App() {
  // Config & Teams
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [team1, setTeam1] = useState<Team>({
    id: 'team1',
    name: 'فريق الأبطال',
    color: 'emerald',
    score: 0,
    roundsWon: 0,
  });
  const [team2, setTeam2] = useState<Team>({
    id: 'team2',
    name: 'فريق النجوم',
    color: 'amber',
    score: 0,
    roundsWon: 0,
  });

  // Turn & Round State
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isTieBreaker, setIsTieBreaker] = useState<boolean>(false);
  const [activeTeamId, setActiveTeamId] = useState<'team1' | 'team2'>('team1');
  const [currentPlateItems, setCurrentPlateItems] = useState<FoodItem[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('turn_active');

  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    DEFAULT_CONFIG.roundDurationSeconds
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Round History & Modals
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [currentRoundTeam1Eval, setCurrentRoundTeam1Eval] = useState<PlateEvaluation | null>(null);
  const [currentRoundTeam2Eval, setCurrentRoundTeam2Eval] = useState<PlateEvaluation | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showPodiumModal, setShowPodiumModal] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

  // Evaluation Guard to Prevent Double-Counting (عدم احتساب الجولة أكثر من مرة)
  const isEvaluatingRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop Timer Utility
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Submit and evaluate current plate (Guarded & Idempotent)
  const handleEvaluateTurn = useCallback(() => {
    // Prevent double invocation
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    stopTimer();

    const isUntimed = config.roundDurationSeconds === 0;
    const evaluation = evaluatePlate(currentPlateItems, remainingSeconds, isUntimed);

    if (activeTeamId === 'team1') {
      setCurrentRoundTeam1Eval(evaluation);
      // Update team 1 score
      setTeam1((prev) => ({
        ...prev,
        score: prev.score + evaluation.totalRoundScore,
      }));
      setShowSummaryModal(true);
    } else {
      // Team 2 turn finished -> round complete!
      setCurrentRoundTeam2Eval(evaluation);
      setTeam2((prev) => ({
        ...prev,
        score: prev.score + evaluation.totalRoundScore,
      }));

      // Commit round to history
      const t1Eval = currentRoundTeam1Eval || evaluatePlate([], 0, isUntimed);
      const t2Eval = evaluation;

      let roundWinner: 'team1' | 'team2' | 'tie' = 'tie';
      if (t1Eval.totalRoundScore > t2Eval.totalRoundScore) {
        roundWinner = 'team1';
        setTeam1((prev) => ({ ...prev, roundsWon: prev.roundsWon + 1 }));
      } else if (t2Eval.totalRoundScore > t1Eval.totalRoundScore) {
        roundWinner = 'team2';
        setTeam2((prev) => ({ ...prev, roundsWon: prev.roundsWon + 1 }));
      }

      setHistory((prev) => [
        ...prev,
        {
          roundNumber: currentRound,
          isTieBreaker,
          team1Evaluation: t1Eval,
          team2Evaluation: t2Eval,
          winner: roundWinner,
        },
      ]);

      setShowSummaryModal(true);
    }
  }, [
    activeTeamId,
    config.roundDurationSeconds,
    currentPlateItems,
    currentRound,
    currentRoundTeam1Eval,
    isTieBreaker,
    remainingSeconds,
    stopTimer,
  ]);

  // Timer Effect
  useEffect(() => {
    if (
      config.roundDurationSeconds > 0 &&
      gamePhase === 'turn_active' &&
      !isPaused &&
      !showSummaryModal &&
      !showPodiumModal &&
      !showSetupModal
    ) {
      stopTimer();

      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            stopTimer();
            sounds.playBuzz();
            setTimeout(() => {
              handleEvaluateTurn();
            }, 50);
            return 0;
          }

          if (prev <= 6 && prev > 1 && config.soundEnabled) {
            sounds.playTick();
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      stopTimer();
    };
  }, [
    config.roundDurationSeconds,
    config.soundEnabled,
    gamePhase,
    handleEvaluateTurn,
    isPaused,
    showPodiumModal,
    showSetupModal,
    showSummaryModal,
    stopTimer,
  ]);

  // Proceed from Round Summary Modal to next turn or next round
  const handleProceedAfterSummary = () => {
    setShowSummaryModal(false);
    isEvaluatingRef.current = false;

    if (activeTeamId === 'team1') {
      // Transition to Team 2 in the same round
      setActiveTeamId('team2');
      setCurrentPlateItems([]);
      setRemainingSeconds(config.roundDurationSeconds);
      setIsPaused(false);
    } else {
      // Team 2 finished
      const isLastRound = isTieBreaker || currentRound >= config.totalRounds;
      if (isLastRound) {
        setShowPodiumModal(true);
      } else {
        // Start next round
        setCurrentRound((prev) => prev + 1);
        setActiveTeamId('team1');
        setCurrentPlateItems([]);
        setCurrentRoundTeam1Eval(null);
        setCurrentRoundTeam2Eval(null);
        setRemainingSeconds(config.roundDurationSeconds);
        setIsPaused(false);
      }
    }
  };

  // Add food item to plate
  const handleAddFood = (item: FoodItem) => {
    if (currentPlateItems.length < config.maxPlateItems) {
      setCurrentPlateItems((prev) => [...prev, item]);
    }
  };

  // Remove food item from plate
  const handleRemoveFood = (index: number) => {
    setCurrentPlateItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear plate
  const handleClearPlate = () => {
    setCurrentPlateItems([]);
  };

  // Full Game Reset
  const handleResetGame = () => {
    stopTimer();
    isEvaluatingRef.current = false;
    setTeam1((prev) => ({ ...prev, score: 0, roundsWon: 0 }));
    setTeam2((prev) => ({ ...prev, score: 0, roundsWon: 0 }));
    setCurrentRound(1);
    setIsTieBreaker(false);
    setActiveTeamId('team1');
    setCurrentPlateItems([]);
    setHistory([]);
    setCurrentRoundTeam1Eval(null);
    setCurrentRoundTeam2Eval(null);
    setShowSummaryModal(false);
    setShowPodiumModal(false);
    setRemainingSeconds(config.roundDurationSeconds);
    setIsPaused(false);
  };

  // Start Sudden Death Tie-Breaker Round
  const handleStartTieBreaker = () => {
    stopTimer();
    isEvaluatingRef.current = false;
    setIsTieBreaker(true);
    setActiveTeamId('team1');
    setCurrentPlateItems([]);
    setCurrentRoundTeam1Eval(null);
    setCurrentRoundTeam2Eval(null);
    setShowSummaryModal(false);
    setShowPodiumModal(false);
    setRemainingSeconds(Math.min(30, config.roundDurationSeconds || 30));
    setIsPaused(false);
  };

  // Save Settings from Setup Modal
  const handleSaveSettings = (
    newConfig: GameConfig,
    t1Name: string,
    t2Name: string
  ) => {
    setConfig(newConfig);
    setTeam1((prev) => ({ ...prev, name: t1Name, score: 0, roundsWon: 0 }));
    setTeam2((prev) => ({ ...prev, name: t2Name, score: 0, roundsWon: 0 }));
    sounds.setMuted(!newConfig.soundEnabled);
    setShowSetupModal(false);
    handleResetGame();
  };

  const activeTeam = activeTeamId === 'team1' ? team1 : team2;
  const plateItemIds = currentPlateItems.map((item) => item.id);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Smartboard Header */}
      <SmartboardHeader
        currentRound={currentRound}
        totalRounds={config.totalRounds}
        isTieBreaker={isTieBreaker}
        soundEnabled={config.soundEnabled}
        onToggleSound={() => {
          const next = !config.soundEnabled;
          setConfig((c) => ({ ...c, soundEnabled: next }));
          sounds.setMuted(!next);
        }}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        onResetGame={handleResetGame}
        onOpenSettings={() => setShowSetupModal(true)}
        canPause={config.roundDurationSeconds > 0 && !showSummaryModal && !showPodiumModal}
      />

      {/* Main Game Stage */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-between px-4 py-3">
        {/* Score Board */}
        <ScoreBoard
          team1={team1}
          team2={team2}
          activeTeamId={activeTeamId}
          roundNumber={currentRound}
        />

        {/* Countdown Timer Bar */}
        <TimerBar
          remainingSeconds={remainingSeconds}
          totalDurationSeconds={config.roundDurationSeconds}
          isPaused={isPaused}
          isUntimed={config.roundDurationSeconds === 0}
        />

        {/* Interactive Healthy Plate */}
        <div className="w-full my-auto flex justify-center">
          <PlateArea
            items={currentPlateItems}
            maxItems={config.maxPlateItems}
            activeTeamColor={activeTeam.color}
            activeTeamName={activeTeam.name}
            onRemoveItem={handleRemoveFood}
            onClearPlate={handleClearPlate}
            onSubmitPlate={handleEvaluateTurn}
            onDropFood={handleAddFood}
            isEvaluating={isEvaluatingRef.current}
          />
        </div>

        {/* Food Shelf (Categorized cards tray) */}
        <FoodShelf
          onAddFood={handleAddFood}
          maxReached={currentPlateItems.length >= config.maxPlateItems}
          plateItemIds={plateItemIds}
        />
      </main>

      {/* Modals */}
      {showSummaryModal && (
        <RoundSummaryModal
          roundNumber={currentRound}
          isTieBreaker={isTieBreaker}
          team={activeTeam}
          evaluation={
            activeTeamId === 'team1'
              ? currentRoundTeam1Eval || evaluatePlate([], 0)
              : currentRoundTeam2Eval || evaluatePlate([], 0)
          }
          isSecondTeamInRound={activeTeamId === 'team2'}
          isLastRound={isTieBreaker || currentRound >= config.totalRounds}
          onProceed={handleProceedAfterSummary}
        />
      )}

      {showPodiumModal && (
        <FinalPodiumModal
          team1={team1}
          team2={team2}
          history={history}
          onPlayAgain={handleResetGame}
          onStartTieBreaker={handleStartTieBreaker}
        />
      )}

      {showSetupModal && (
        <GameSetupModal
          initialConfig={config}
          team1Name={team1.name}
          team2Name={team2.name}
          onSave={handleSaveSettings}
          onClose={() => setShowSetupModal(false)}
        />
      )}
    </div>
  );
}
