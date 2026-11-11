import React, { useState } from 'react';
import { FoodItem, FoodCategory } from '../types/game';
import { HEALTHY_CORE_CATEGORIES, CATEGORY_NAMES_AR } from '../utils/nutritionScoring';
import { sounds } from '../utils/soundEffects';
import { Trash2, CheckCircle2, AlertTriangle, Sparkles, Send, X } from 'lucide-react';

interface PlateAreaProps {
  items: FoodItem[];
  maxItems: number;
  activeTeamColor: 'emerald' | 'amber';
  activeTeamName: string;
  onRemoveItem: (index: number) => void;
  onClearPlate: () => void;
  onSubmitPlate: () => void;
  onDropFood: (item: FoodItem) => void;
  isEvaluating: boolean;
}

export const PlateArea: React.FC<PlateAreaProps> = ({
  items,
  maxItems,
  activeTeamColor,
  activeTeamName,
  onRemoveItem,
  onClearPlate,
  onSubmitPlate,
  onDropFood,
  isEvaluating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Covered categories calculation
  const coveredGroups = new Set<FoodCategory>();
  let hasJunk = false;
  let junkCount = 0;

  items.forEach((item) => {
    if (item.category === 'junk') {
      hasJunk = true;
      junkCount++;
    } else {
      coveredGroups.add(item.category);
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const item: FoodItem = JSON.parse(dataStr);
        onDropFood(item);
      }
    } catch {
      // Fallback
    }
  };

  const isEmerald = activeTeamColor === 'emerald';

  return (
    <div className="w-full flex flex-col items-center">
      {/* 5-Group Diversity Status Strip */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 mb-3.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>مقياس التنوع الغذائي للطبق الصحي:</span>
          </div>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {coveredGroups.size} من 5 مجموعات أساسية
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {HEALTHY_CORE_CATEGORIES.map((cat) => {
            const isCovered = coveredGroups.has(cat);
            return (
              <div
                key={cat}
                className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border text-center transition-all ${
                  isCovered
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 font-bold'
                }`}
              >
                {isCovered ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="text-xs truncate">{CATEGORY_NAMES_AR[cat]}</span>
              </div>
            );
          })}
        </div>

        {hasJunk && (
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                يحتوي الطبق على {junkCount} صنف غير صحي (خصم {junkCount * 20} نقطة)! اضغط على الصنف لإزالته.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Healthy Plate Stage */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-3xl p-5 sm:p-6 transition-all border-2 shadow-sm ${
          isDragOver
            ? 'bg-emerald-50/70 border-emerald-400 scale-[1.01]'
            : isEmerald
            ? 'bg-white border-emerald-300 shadow-emerald-600/5'
            : 'bg-white border-amber-300 shadow-amber-600/5'
        }`}
      >
        {/* Plate Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isEmerald ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500 ring-4 ring-amber-100'
              }`}
            />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              طبق {activeTeamName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              المحتويات: <span className="text-slate-900 font-mono">{items.length}</span> / {maxItems}
            </span>
          </div>
        </div>

        {/* Plate Visual Well (Circular Ceramic Plate Motif) */}
        <div className="my-5 min-h-[200px] sm:min-h-[220px] rounded-3xl bg-slate-50/90 border-2 border-dashed border-slate-200 p-4 flex flex-wrap items-center justify-center gap-3 content-center">
          {items.length === 0 ? (
            <div className="text-center py-6 px-4">
              <div className="text-5xl mb-2">🍽️</div>
              <p className="text-sm sm:text-base font-black text-slate-700">
                الطبق فارغ حالياً
              </p>
              <p className="text-xs text-slate-500 mt-1">
                اضغط على بطاقات الأطعمة بالأسفل أو اسحبها لإضافتها للطبق
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const isJunk = item.category === 'junk';
              return (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onRemoveItem(index);
                  }}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${
                    isJunk
                      ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100'
                      : 'bg-white border-slate-200 text-slate-900 hover:border-rose-300 hover:shadow-md'
                  }`}
                  title="اضغط لحذف هذا الصنف من الطبق"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="text-right">
                    <div className="text-sm font-black leading-tight">{item.name}</div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {item.categoryLabelAr}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-rose-600 text-slate-400 group-hover:text-white flex items-center justify-center mr-1 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onClearPlate();
            }}
            disabled={items.length === 0 || isEvaluating}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-black text-sm transition-all border border-slate-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            <span>تفريغ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (items.length > 0 && !isEvaluating) {
                sounds.playChime();
                onSubmitPlate();
              }
            }}
            disabled={items.length === 0 || isEvaluating}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg transition-all transform active:scale-98 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isEmerald
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
            }`}
          >
            <Send className="w-5 h-5 rotate-180" />
            <span>
              {isEvaluating ? 'جاري الاعتماد...' : 'اعتماد وتسليم الطبق'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
