import React from 'react';
import { Team } from '../types/game';
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
  team1: Team;
  team2: Team;
  activeTeamId: 'team1' | 'team2';
  roundNumber: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  team1,
  team2,
  activeTeamId,
}) => {
  return (
    <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 my-2">
      {/* Team 1 (Emerald) */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all border-2 ${
          activeTeamId === 'team1'
            ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
            : 'bg-white border-slate-200 opacity-80'
        }`}
      >
        {activeTeamId === 'team1' && (
          <div className="absolute top-2 left-3 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            دور الفريق الحالي
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🟢</span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900">{team1.name}</h2>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500 inline" />
                <span>فوز: {team1.roundsWon} جولة</span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-emerald-800">
              {team1.score}
            </span>
            <span className="block text-[11px] text-slate-600 font-bold">
              نقطة
            </span>
          </div>
        </div>
      </div>

      {/* Team 2 (Amber) */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all border-2 ${
          activeTeamId === 'team2'
            ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white border-slate-200 opacity-80'
        }`}
      >
        {activeTeamId === 'team2' && (
          <div className="absolute top-2 left-3 bg-amber-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            دور الفريق الحالي
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🟠</span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900">{team2.name}</h2>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500 inline" />
                <span>فوز: {team2.roundsWon} جولة</span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-amber-800">
              {team2.score}
            </span>
            <span className="block text-[11px] text-slate-600 font-bold">
              نقطة
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
