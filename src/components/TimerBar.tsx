import React from 'react';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  isUntimed: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  remainingSeconds,
  totalDurationSeconds,
  isPaused,
  isUntimed,
}) => {
  if (isUntimed) {
    return (
      <div className="w-full py-1.5 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-white rounded-xl border border-slate-200">
        <Clock className="w-4 h-4 text-emerald-600" />
        <span>وضع تعليمي مفتوح (بدون مؤقت زمني)</span>
      </div>
    );
  }

  const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalDurationSeconds) * 100));
  const isUrgent = remainingSeconds <= 10;
  const isCritical = remainingSeconds <= 5;

  let colorClass = 'bg-emerald-600';
  let textClass = 'text-emerald-800';

  if (isCritical) {
    colorClass = 'bg-rose-600 animate-pulse';
    textClass = 'text-rose-700 font-black animate-bounce';
  } else if (isUrgent) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-800 font-black';
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-3 mb-2 shadow-xs">
      <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Clock className={`w-4 h-4 ${textClass}`} />
          <span>الوقت المتبقي للجولة:</span>
          {isPaused && (
            <span className="text-amber-700 font-black bg-amber-100 px-2 py-0.5 rounded text-xs border border-amber-300">
              موقوف مؤقتاً
            </span>
          )}
        </div>
        <div className={`text-base sm:text-lg font-black tabular-nums tracking-wider ${textClass}`}>
          {remainingSeconds} ثانية
        </div>
      </div>

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-linear ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
