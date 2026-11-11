import React from 'react';
import { PlateEvaluation, Team } from '../types/game';
import { sounds } from '../utils/soundEffects';
import { Sparkles, AlertTriangle, ArrowLeft, Trophy, CheckCircle } from 'lucide-react';

interface RoundSummaryModalProps {
  roundNumber: number;
  isTieBreaker: boolean;
  team: Team;
  evaluation: PlateEvaluation;
  isSecondTeamInRound: boolean;
  isLastRound: boolean;
  onProceed: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  roundNumber,
  isTieBreaker,
  team,
  evaluation,
  isSecondTeamInRound,
  isLastRound,
  onProceed,
}) => {
  const isEmerald = team.color === 'emerald';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-black text-slate-700 border border-slate-200 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isTieBreaker ? 'جولة الحسم الفاصلة' : `نتيجة الجولة ${roundNumber}`}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            تقييم طبق <span className={isEmerald ? 'text-emerald-700' : 'text-amber-700'}>{team.name}</span>
          </h2>

          <div className="mt-2 inline-block px-3.5 py-1 rounded-xl text-xs font-black bg-slate-100 border border-slate-200">
            التقدير الغذائي:{' '}
            <span
              className={
                evaluation.healthGrade === 'ممتاز'
                  ? 'text-emerald-700'
                  : evaluation.healthGrade === 'جيد جداً'
                  ? 'text-teal-700'
                  : evaluation.healthGrade === 'مقبول'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }
            >
              {evaluation.healthGrade}
            </span>
          </div>
        </div>

        {/* Selected Items Mini Gallery */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-4">
          <div className="text-xs font-black text-slate-600 mb-2">مكونات الطبق المعتمدة:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {evaluation.items.length === 0 ? (
              <span className="text-xs text-slate-500 font-bold">لم يتم اختيار أي أصناف</span>
            ) : (
              evaluation.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-800 shadow-2xs"
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Points Table */}
        <div className="space-y-1.5 mb-5 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700">
            <span>نقاط القيمة الغذائية:</span>
            <span className="font-mono font-black text-slate-900 tabular-nums">
              +{evaluation.basePoints}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              مكافأة تنوع المجموعات ({evaluation.distinctGroupsCount} من 5):
            </span>
            <span className="font-mono font-black text-emerald-800 tabular-nums">
              +{evaluation.diversityBonus}
            </span>
          </div>

          {evaluation.speedBonus > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 font-bold text-teal-900">
              <span>مكافأة السرعة المتبقية:</span>
              <span className="font-mono font-black text-teal-800 tabular-nums">
                +{evaluation.speedBonus}
              </span>
            </div>
          )}

          {evaluation.penalties > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold text-rose-900">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                خصم أطعمة غير صحية ({evaluation.junkCount} صنف):
              </span>
              <span className="font-mono font-black text-rose-800 tabular-nums">
                -{evaluation.penalties}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 text-white font-black text-base">
            <span>مجموع نقاط الجولة:</span>
            <span className="font-mono text-xl text-amber-300 tabular-nums">
              {evaluation.totalRoundScore} نقطة
            </span>
          </div>
        </div>

        {/* Nutritional Advice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed mb-5">
          <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>نصيحة أخصائي التغذية للطلاب:</span>
          </div>
          <p>{evaluation.feedbackText}</p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onProceed();
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-sm cursor-pointer transition-all active:scale-98"
        >
          <span>
            {!isSecondTeamInRound
              ? 'الانتقال إلى دور الفريق الثاني'
              : isLastRound
              ? 'عرض النتائج النهائية والتتويج'
              : 'بدء الجولة القادمة'}
          </span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
