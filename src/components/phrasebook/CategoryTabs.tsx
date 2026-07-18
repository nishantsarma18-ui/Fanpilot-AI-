import React from 'react';
import { PhraseCategory } from '../../types.js';

interface CategoryTabsProps {
  categories: PhraseCategory[];
  activeCategory: string;
  onSelectCategory: (id: 'matchday' | 'food_drink' | 'transit' | 'chants' | 'emergencies') => void;
}

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'matchday':
      return '🎟️';
    case 'food_drink':
      return '🍔';
    case 'transit':
      return '🚇';
    case 'chants':
      return '📣';
    case 'emergencies':
      return '🚨';
    default:
      return '💬';
  }
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {categories.map((cat) => {
        const isSelected = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg'
                : 'border-white/5 bg-[#0a0a0a] hover:border-white/20 text-white/70'
            }`}
            id={`phrase-cat-${cat.id}`}
          >
            <span className="text-lg" aria-hidden="true">{getCategoryIcon(cat.id)}</span>
            <span className="text-[11px] font-semibold leading-tight line-clamp-1">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
