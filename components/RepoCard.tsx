import React from 'react';
import { Repository } from '../types';
import { Star, Code2, ExternalLink, Github, Bookmark, BookmarkCheck, Zap, Smile, Meh, Frown } from './Icons';

interface RepoCardProps {
  repo: Repository;
  onBookmark?: (repo: Repository) => void;
  onClick?: (repo: Repository) => void;
  isBookmarked?: boolean;
  delay?: number;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onBookmark, onClick, isBookmarked = false, delay = 0 }) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) onBookmark(repo);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Determine score color and label
  const getScoreAttributes = (score: number) => {
    if (score >= 80) return { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', label: 'Viral' };
    if (score >= 60) return { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Trending' };
    return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Rising' };
  };

  const getSentimentVisual = (score: number = 50) => {
    if (score >= 70) return { 
      Icon: Smile, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20',
      label: 'Positive' 
    };
    if (score >= 40) return { 
      Icon: Meh, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/20',
      label: 'Neutral' 
    };
    return { 
      Icon: Frown, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      label: 'Negative' 
    };
  };

  const scoreAttr = getScoreAttributes(repo.trendingScore || 0);
  const { Icon: SentimentIcon, color: sentColor, bg: sentBg, border: sentBorder, label: sentLabel } = getSentimentVisual(repo.sentimentScore);

  return (
    <div 
      onClick={() => onClick && onClick(repo)}
      className="group relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col h-full animate-slide-up cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {onBookmark && (
          <button 
            onClick={handleBookmarkClick}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked 
                ? 'text-yellow-400 bg-yellow-400/10' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            }`}
            title={isBookmarked ? "Remove from Portfolio" : "Add to Portfolio"}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {/* Trending Score Badge */}
      <div className={`absolute top-4 left-4 flex items-center px-2 py-1 rounded-md text-xs font-bold ${scoreAttr.bg} ${scoreAttr.color} border ${scoreAttr.border} z-10`}>
        <Zap size={12} className="mr-1 fill-current" />
        {repo.trendingScore || 0}
      </div>

      <div className="flex items-center space-x-3 mb-4 mt-8">
        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-950/30 group-hover:text-cyan-400 transition-colors">
          <Github size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors truncate max-w-[200px]" title={repo.name}>
            {repo.name}
          </h3>
          <p className="text-xs text-gray-500">{repo.owner}</p>
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
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-yellow-500 text-sm" title="Stars">
            <Star size={14} className="mr-1 fill-yellow-500" />
            <span>{repo.stars}</span>
          </div>
          <div className="flex items-center text-cyan-500 text-sm" title="Language">
            <Code2 size={14} className="mr-1" />
            <span>{repo.language}</span>
          </div>
        </div>
        
        {/* Sentiment Indicator Badge */}
        <div 
          className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sentBg} ${sentBorder} ${sentColor}`}
          title={`Community Sentiment: ${repo.sentimentScore || 50}/100`}
        >
          <SentimentIcon size={12} className="mr-1.5" />
          <span className="hidden sm:inline mr-1">{sentLabel}</span>
          <span className="font-bold">{repo.sentimentScore || 50}</span>
        </div>
      </div>
    </div>
  );
};

export default RepoCard;