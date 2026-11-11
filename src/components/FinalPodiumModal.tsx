import React, { useEffect } from 'react';
import { Team, RoundResult } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { Trophy, RotateCcw, Swords } from 'lucide-react';

interface FinalPodiumModalProps {
  team1: Team;
  team2: Team;
  history: RoundResult[];
  onPlayAgain: () => void;
  onStartTieBreaker: () => void;
}

export const FinalPodiumModal: React.FC<FinalPodiumModalProps> = ({
  team1,
  team2,
  history,
  onPlayAgain,
  onStartTieBreaker,
}) => {
  const isTie = team1.score === team2.score;
  const winner = team1.score > team2.score ? team1 : team2;
  const runnerUp = team1.score > team2.score ? team2 : team1;

  useEffect(() => {
    sounds.playFanfare();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2 animate-bounce">
            {isTie ? '🤝' : '🏆'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isTie ? (
              <span className="text-amber-600">تعادل بطولي بين الفريقين!</span>
            ) : (
              <span>
                مبروك الفوز لـ{' '}
                <span className={winner.color === 'emerald' ? 'text-emerald-700' : 'text-amber-700'}>
                  {winner.name}
                </span>
                !
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isTie
              ? `تساوت نقاط الفريقين بمجموع (${team1.score}) نقطة لكل فريق!`
              : `فوز مستحق بمجموع (${winner.score}) نقطة مقابل (${runnerUp.score}) نقطة.`}
          </p>
        </div>

        {/* Podium Comparison Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Team 1 Summary */}
          <div
            className={`p-4 rounded-2xl border-2 text-center ${
              !isTie && winner.id === 'team1'
                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-2xl mb-1">🟢</div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">{team1.name}</h3>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-800 my-1 tabular-nums">
              {team1.score}
            </div>
            <p className="text-xs font-bold text-slate-500">
              فاز في {team1.roundsWon} جولات
            </p>
          </div>

          {/* Team 2 Summary */}
          <div
            className={`p-4 rounded-2xl border-2 text-center ${
              !isTie && winner.id === 'team2'
                ? 'bg-amber-50 border-amber-500 shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-2xl mb-1">🟠</div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">{team2.name}</h3>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-800 my-1 tabular-nums">
              {team2.score}
            </div>
            <p className="text-xs font-bold text-slate-500">
              فاز في {team2.roundsWon} جولات
            </p>
          </div>
        </div>

        {/* Round by Round History Audit Table */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-3 border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              سجل تفاصيل نقاط الجولات:
            </span>
            <span className="text-slate-500 font-bold">{history.length} جولات معتمدة</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {history.map((record, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold"
                >
                  <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-black">
                    {record.isTieBreaker ? 'جولة الحسم' : `جولة ${record.roundNumber}`}
                  </span>

                  <div className="flex items-center gap-3 font-mono font-black">
                    <span className="text-emerald-800 tabular-nums">
                      {team1.name}: {record.team1Evaluation.totalRoundScore} ن
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-amber-800 tabular-nums">
                      {team2.name}: {record.team2Evaluation.totalRoundScore} ن
                    </span>
                  </div>

                  <div>
                    {record.winner === 'team1' ? (
                      <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        فوز {team1.name}
                      </span>
                    ) : record.winner === 'team2' ? (
                      <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        فوز {team2.name}
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        تعادل
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isTie && (
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onStartTieBreaker();
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-base shadow-sm cursor-pointer transition-all active:scale-98"
            >
              <Swords className="w-5 h-5" />
              <span>بدء جولة الحسم الفاصلة</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onPlayAgain();
            }}
            className={`w-full ${
              isTie ? 'sm:w-auto sm:px-8' : 'sm:flex-1'
            } flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-sm cursor-pointer transition-all active:scale-98`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>بدء لعبة جديدة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
