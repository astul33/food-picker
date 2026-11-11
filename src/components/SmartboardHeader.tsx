import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Pause,
  Play,
  Settings,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SmartboardHeaderProps {
  currentRound: number;
  totalRounds: number;
  isTieBreaker: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetGame: () => void;
  onOpenSettings: () => void;
  canPause: boolean;
}

export const SmartboardHeader: React.FC<SmartboardHeaderProps> = ({
  currentRound,
  totalRounds,
  isTieBreaker,
  soundEnabled,
  onToggleSound,
  isPaused,
  onTogglePause,
  onResetGame,
  onOpenSettings,
  canPause,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    sounds.playTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
      {/* Brand & Round Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl shadow-sm text-white">
          🥗
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              تحدي الطبق الصحي
            </h1>
            {isTieBreaker ? (
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                جولة الحسم الفاصلة
              </span>
            ) : (
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                الجولة {currentRound} من {totalRounds}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            نشاط تفاعلي لتركيب وجبة صحية متوازنة بين الفريقين
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {canPause && (
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onTogglePause();
            }}
            title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
              isPaused
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span className="hidden md:inline">{isPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onToggleSound();
          }}
          title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          aria-label="الصوت"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'تصغير' : 'ملء الشاشة للسبورة'}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          aria-label="ملء الشاشة"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-slate-700" />
          ) : (
            <Maximize2 className="w-4 h-4 text-slate-700" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onOpenSettings();
          }}
          title="الإعدادات"
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          aria-label="الإعدادات"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onResetGame();
          }}
          title="إعادة بدء اللعبة"
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
          aria-label="إعادة بدء"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
