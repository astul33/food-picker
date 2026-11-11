import React, { useState, useMemo } from 'react';
import { FoodCategory, FoodItem } from '../types/game';
import { FOOD_DATABASE, CATEGORY_DEFINITIONS } from '../data/foodItems';
import { sounds } from '../utils/soundEffects';
import { Plus, Search, X, Sparkles, AlertTriangle } from 'lucide-react';

interface FoodShelfProps {
  onAddFood: (item: FoodItem) => void;
  maxReached: boolean;
  plateItemIds?: string[];
}

export const FoodShelf: React.FC<FoodShelfProps> = ({
  onAddFood,
  maxReached,
  plateItemIds = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FOOD_DATABASE.length };
    FOOD_DATABASE.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered foods by category and search
  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.trim().toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.benefit.toLowerCase().includes(q) ||
        item.categoryLabelAr.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleDragStart = (e: React.DragEvent, item: FoodItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleItemClick = (e: React.MouseEvent | React.TouchEvent, item: FoodItem) => {
    e.preventDefault();
    if (!maxReached) {
      sounds.playDrop();
      onAddFood(item);
    } else {
      sounds.playBuzz();
    }
  };

  const categories: Array<{ id: FoodCategory | 'all'; label: string; icon: string }> = [
    { id: 'all', label: 'الكل', icon: '🍽️' },
    { id: 'vegetables', label: 'خضروات', icon: '🥦' },
    { id: 'fruits', label: 'فواكه', icon: '🍎' },
    { id: 'grains', label: 'نشويات', icon: '🌾' },
    { id: 'proteins', label: 'بروتينات', icon: '🍗' },
    { id: 'dairy', label: 'ألبان', icon: '🥛' },
    { id: 'junk', label: 'غير صحي', icon: '⚠️' },
  ];

  return (
    <section className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mt-4">
      {/* Header and Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>سلة الأطعمة المتاحة</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {FOOD_DATABASE.length} صنف غذائي متنوع
            </span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            اختر 5 أطعمة لتغطية المجموعات الغذائية المتوازنة وتجنب الأطعمة غير الصحية
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث سريع (مثل: سلمون، شوفان، جزر...)"
            className="w-full pr-9 pl-8 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Tab Selector with Badge Counts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-thin">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sounds.playTap();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
        <span>
          عرض <span className="font-mono text-slate-800">{filteredFoods.length}</span> صنف
          {searchQuery ? ` مطابقة للبحث "${searchQuery}"` : ''}
        </span>
        {maxReached && (
          <span className="text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            الطبق ممتلئ (5/5) — يمكنك اعتماده أو إزالة عنصر للتغيير
          </span>
        )}
      </div>

      {/* Grid of Food Cards */}
      {filteredFoods.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm font-black text-slate-700">لم يتم العثور على أطعمة مطابقة</p>
          <p className="text-xs text-slate-500 mt-1">
            جرب كلمة بحث أخرى أو اضغط على تصنيف مختلف من القائمة أعلاه
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              إلغاء البحث وعرض كل الأصناف
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[340px] overflow-y-auto pr-1">
          {filteredFoods.map((item) => {
            const isJunk = item.category === 'junk';
            const def = CATEGORY_DEFINITIONS[item.category];
            const isAlreadyInPlate = plateItemIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                draggable={!maxReached}
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={(e) => handleItemClick(e, item)}
                disabled={maxReached}
                aria-label={`إضافة ${item.name}`}
                className={`relative flex flex-col justify-between p-3 rounded-2xl border text-right transition-all transform active:scale-95 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  maxReached
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                    : isJunk
                    ? 'bg-rose-50/70 hover:bg-rose-100/90 border-rose-200 hover:border-rose-300 shadow-xs hover:shadow-sm'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Badge & Emoji */}
                <div className="flex items-start justify-between w-full">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${def.badgeBg}`}
                  >
                    {def.label}
                  </span>
                </div>

                {/* Title & Benefit */}
                <div className="mt-2.5 w-full">
                  <div className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-700">
                    {item.name}
                  </div>
                  <div
                    className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug"
                    title={item.benefit}
                  >
                    {item.benefit}
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between w-full text-xs font-black">
                  <span className={isJunk ? 'text-rose-700' : 'text-emerald-700'}>
                    {isJunk ? '-20 نقطة' : `+${item.basePoints}`}
                  </span>

                  <span className="inline-flex items-center gap-1 text-slate-700 group-hover:text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 group-hover:border-emerald-300 shadow-2xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
