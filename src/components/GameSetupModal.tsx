import React, { useState } from 'react';
import { GameConfig } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { Settings, Play, X, Clock, Users, Layers } from 'lucide-react';

interface GameSetupModalProps {
  initialConfig: GameConfig;
  team1Name: string;
  team2Name: string;
  onSave: (config: GameConfig, t1Name: string, t2Name: string) => void;
  onClose: () => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  initialConfig,
  team1Name: initialT1,
  team2Name: initialT2,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<GameConfig>(initialConfig);
  const [team1Name, setTeam1Name] = useState(initialT1);
  const [team2Name, setTeam2Name] = useState(initialT2);

  const durationOptions = [
    { label: '30 ثانية (سريع)', value: 30 },
    { label: '45 ثانية (متوازن)', value: 45 },
    { label: '60 ثانية (مريح)', value: 60 },
    { label: 'بدون وقت (تعليمي)', value: 0 },
  ];

  const roundOptions = [1, 2, 3, 5];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-black">إعدادات التحدي</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Team Names */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-black text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>أسماء الفريقين:</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="block text-[11px] font-bold text-emerald-700 mb-1">الفريق الأخضر:</span>
              <input
                type="text"
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                maxLength={20}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-amber-700 mb-1">الفريق البرتقالي:</span>
              <input
                type="text"
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                maxLength={20}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Number of Rounds */}
        <div className="mb-5">
          <label className="block text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>عدد الجولات:</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {roundOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setConfig({ ...config, totalRounds: r });
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                  config.totalRounds === r
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r} {r === 1 ? 'جولة' : 'جولات'}
              </button>
            ))}
          </div>
        </div>

        {/* Duration per Turn */}
        <div className="mb-6">
          <label className="block text-xs font-black text-slate-700 flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>مدة الجولة لكل فريق:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  setConfig({ ...config, roundDurationSeconds: opt.value });
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border text-center cursor-pointer ${
                  config.roundDurationSeconds === opt.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={() => {
            sounds.playChime();
            onSave(config, team1Name.trim() || 'فريق الأبطال', team2Name.trim() || 'فريق النجوم');
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-sm cursor-pointer transition-all active:scale-98"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>حفظ وبدء اللعبة</span>
        </button>
      </div>
    </div>
  );
};
