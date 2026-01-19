
import React, { useState } from 'react';
import { PortfolioItem, Repository } from '../types';
import RepoCard from './RepoCard';
import { Trash2, Wand2, X } from './Icons';

interface PortfolioViewProps {
  items: PortfolioItem[];
  onRemove: (id: string) => void;
  onRepoClick: (repo: Repository) => void;
  onClear: () => void;
  onLaunchStudio: (selectedRepos: Repository[]) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ items, onRemove, onRepoClick, onClear, onLaunchStudio }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (repo: Repository) => {
    const id = (repo as PortfolioItem).id;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleLaunchStudio = () => {
    const selectedRepos = items.filter(item => selectedIds.has(item.id));
    onLaunchStudio(selectedRepos);
  };

  const clearSelection = () => setSelectedIds(new Set());

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
    <div className="animate-fade-in relative pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Portfolio <span className="text-cyan-500">({items.length})</span></h2>
        <div className="flex items-center space-x-4">
          {selectedIds.size > 0 && (
            <button 
              onClick={clearSelection}
              className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Clear Selection
            </button>
          )}
          <button 
            onClick={onClear}
            className="text-sm text-red-400 hover:text-red-300 flex items-center px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} className="mr-2" />
            Clear All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <RepoCard 
            key={item.id} 
            repo={item} 
            isBookmarked={true}
            onBookmark={() => onRemove(item.id)}
            onClick={onRepoClick}
            isSelected={selectedIds.has(item.id)}
            onSelect={toggleSelect}
            showSelection={true}
            delay={index * 50}
          />
        ))}
      </div>

      {/* Floating Studio Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-full px-6 py-3 flex items-center space-x-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium text-gray-200">Selected Repositories</span>
            </div>
            <div className="h-6 w-px bg-gray-700"></div>
            <button 
              onClick={handleLaunchStudio}
              className="flex items-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-1.5 rounded-full text-sm font-bold transition-all transform hover:scale-105"
            >
              <Wand2 size={16} className="mr-2" />
              Launch Studio
            </button>
            <button 
              onClick={clearSelection}
              className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;
