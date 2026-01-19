
import React from 'react';
import { Repository } from '../types';
import { Star, Code2, Github, Bookmark, BookmarkCheck, Zap, Smile, Meh, Frown, Check } from './Icons';

interface RepoCardProps {
  repo: Repository;
  onBookmark?: (repo: Repository) => void;
  onClick?: (repo: Repository) => void;
  isBookmarked?: boolean;
  isSelected?: boolean;
  onSelect?: (repo: Repository) => void;
  showSelection?: boolean;
  delay?: number;
}

const RepoCard: React.FC<RepoCardProps> = ({ 
  repo, onBookmark, onClick, isBookmarked = false, 
  isSelected = false, onSelect, showSelection = false, delay = 0 
}) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) onBookmark(repo);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(repo);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getScoreAttributes = (score: number) => {
    if (score >= 80) return { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' };
    if (score >= 60) return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  };

  const getSentimentVisual = (score: number = 50) => {
    if (score >= 70) return { Icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Positive' };
    if (score >= 40) return { Icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Neutral' };
    return { Icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Negative' };
  };

  const scoreAttr = getScoreAttributes(repo.trendingScore || 0);
  const { Icon: SentimentIcon, color: sentColor, bg: sentBg, border: sentBorder, label: sentLabel } = getSentimentVisual(repo.sentimentScore);

  return (
    <div 
      onClick={() => onClick && onClick(repo)}
      className={`group relative bg-gray-900 border rounded-xl p-6 transition-all duration-300 flex flex-col h-full animate-slide-up cursor-pointer ${
        isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-gray-800 hover:border-gray-700 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {showSelection && (
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={handleSelectClick}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? 'bg-cyan-600 border-cyan-500 text-white' : 'border-gray-700 bg-gray-950/50 hover:border-cyan-500/50'
            }`}
          >
            {isSelected && <Check size={14} strokeWidth={3} />}
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {onBookmark && (
          <button 
            onClick={handleBookmarkClick}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {!showSelection && (
        <div className={`absolute top-4 left-4 flex items-center px-2 py-1 rounded-md text-xs font-bold ${scoreAttr.bg} ${scoreAttr.color} border ${scoreAttr.border} z-10`}>
          <Zap size={12} className="mr-1 fill-current" />
          {repo.trendingScore || 0}
        </div>
      )}

      <div className="flex items-center space-x-3 mb-4 mt-8">
        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-950/30 group-hover:text-cyan-400 transition-colors">
          <Github size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors truncate max-w-[180px]">
            {repo.name}
          </h3>
          <a
            href={`https://github.com/${repo.owner}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            className="text-xs text-gray-400 hover:text-cyan-500 hover:underline transition-colors block"
          >
            {repo.owner}
          </a>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
        {repo.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {repo.tags?.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-gray-800 text-gray-300 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center text-yellow-500"><Star size={14} className="mr-1 fill-yellow-500" />{repo.stars}</div>
          <div className="flex items-center text-cyan-500"><Code2 size={14} className="mr-1" />{repo.language}</div>
        </div>
        
        <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sentBg} ${sentBorder} ${sentColor}`}>
          <SentimentIcon size={12} className="mr-1.5" />
          <span className="font-bold">{repo.sentimentScore || 50}</span>
        </div>
      </div>
    </div>
  );
};

export default RepoCard;
