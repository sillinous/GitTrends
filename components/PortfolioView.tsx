import React from 'react';
import { PortfolioItem, Repository } from '../types';
import RepoCard from './RepoCard';
import { Trash2 } from './Icons';

interface PortfolioViewProps {
  items: PortfolioItem[];
  onRemove: (id: string) => void;
  onRepoClick: (repo: Repository) => void;
  onClear: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ items, onRemove, onRepoClick, onClear }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
          <Trash2 size={24} className="opacity-50" />
        </div>
        <p>Your portfolio is empty. Bookmark trends to save them here.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Portfolio <span className="text-cyan-500">({items.length})</span></h2>
        <button 
          onClick={onClear}
          className="text-sm text-red-400 hover:text-red-300 flex items-center px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} className="mr-2" />
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <RepoCard 
            key={item.id} 
            repo={item} 
            isBookmarked={true}
            onBookmark={() => onRemove(item.id)}
            onClick={onRepoClick}
            delay={index * 50}
          />
        ))}
      </div>
    </div>
  );
};

export default PortfolioView;
