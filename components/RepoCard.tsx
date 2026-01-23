
import React from 'react';
import { Repository } from '../types';
import { Star, Code2, Github, Bookmark, BookmarkCheck, Zap, Smile, Meh, Frown, Check, TrendingUp, ExternalLink } from './Icons';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

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
    if (score >= 80) return { color: 'text-pink-400', hex: '#ec4899', bg: 'bg-pink-500/10', border: 'border-pink-500/20' };
    if (score >= 60) return { color: 'text-cyan-400', hex: '#22d3ee', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
    return { color: 'text-blue-400', hex: '#60a5fa', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  };

  const getSentimentVisual = (score: number = 50) => {
    if (score >= 70) return { Icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Positive' };
    if (score >= 40) return { Icon: Meh, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Neutral' };
    return { Icon: Frown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Negative' };
  };
  
  // Format momentum data for Recharts
  const momentumData = React.useMemo(() => {
    if (repo.momentumHistory && repo.momentumHistory.length === 7) {
      return repo.momentumHistory.map((val, i) => ({ day: i, v: val }));
    }
    // Fallback if data missing
    return Array.from({ length: 7 }, (_, i) => ({ 
      day: i, 
      v: Math.floor((repo.trendingScore || 50) * (0.5 + Math.random() * 0.5)) 
    }));
  }, [repo.momentumHistory, repo.trendingScore]);

  const scoreAttr = getScoreAttributes(repo.trendingScore || 0);
  const { Icon: SentimentIcon, color: sentColor, bg: sentBg, border: sentBorder, label: sentLabel } = getSentimentVisual(repo.sentimentScore);

  return (
    <div 
      onClick={() => onClick && onClick(repo)}
      className={`group relative bg-gray-900 border rounded-xl p-6 transition-all duration-300 flex flex-col h-full animate-slide-up cursor-pointer ${
        isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-gray-800 hover:border-gray-700 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
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
            title={isBookmarked ? "Remove from Portfolio" : "Add to Portfolio"}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {!showSelection && (
        <div 
          className={`absolute top-4 left-4 flex items-center px-2 py-1 rounded-md text-xs font-bold ${scoreAttr.bg} ${scoreAttr.color} border ${scoreAttr.border} z-10`}
          title="AI Trending Score (0-100)"
        >
          <Zap size={12} className="mr-1 fill-current" />
          {repo.trendingScore || 0}
        </div>
      )}

      <div className="flex-grow flex flex-col">
        <div className="flex items-center space-x-3 mb-4 mt-8">
          <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-950/30 group-hover:text-cyan-400 transition-colors">
            <Github size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors truncate" title={repo.name}>
              {repo.name}
            </h3>
            <a
              href={`https://github.com/${repo.owner}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="text-xs text-gray-400 hover:text-cyan-500 hover:underline transition-colors block"
              title={`View ${repo.owner} on GitHub`}
            >
              {repo.owner}
            </a>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2" title={repo.description}>
          {repo.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {repo.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-gray-800 text-gray-300 rounded-md">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Momentum Bar Chart */}
        <div className="mt-auto pt-4 bg-gray-950/40 p-4 rounded-xl border border-gray-800/50">
           <div className="flex justify-between items-center mb-3">
              <div 
                className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 flex items-center"
                title="7-Day Interest Velocity"
              >
                 <TrendingUp size={10} className="mr-1.5" /> 7D Velocity
              </div>
              <div 
                className={`text-[9px] font-black ${scoreAttr.color} uppercase`}
                title="Projected Growth Rate"
              >
                 +{Math.round((repo.trendingScore || 0) / 4)}% Growth
              </div>
           </div>
           <div className="h-12 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={momentumData}>
                 <Bar dataKey="v" radius={[2, 2, 0, 0]} animationDuration={1000}>
                    {momentumData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={scoreAttr.hex} 
                        fillOpacity={0.3 + (index * 0.1)} 
                      />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="flex items-end justify-between pt-4 border-t border-gray-800 mt-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-3 text-xs text-gray-500 font-medium">
            <div className="flex items-center space-x-1" title="Total GitHub Stars">
              <Star size={12} className="text-yellow-500/80 fill-yellow-500/20" />
              <span>{repo.stars}</span>
            </div>
            <div className="flex items-center space-x-1" title="Primary Language">
              <Code2 size={12} className="text-cyan-500/80" />
              <span>{repo.language}</span>
            </div>
          </div>
          
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border ${sentBg} ${sentBorder} ${sentColor}`}
            title={`Sentiment Score: ${repo.sentimentScore || 50}/100`}
          >
            <SentimentIcon size={14} strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{sentLabel}</span>
          </div>
        </div>
        
        <a
           href={repo.url}
           target="_blank"
           rel="noopener noreferrer"
           onClick={(e) => e.stopPropagation()}
           className="flex items-center justify-center px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all text-xs font-bold shadow-sm group hover:border-gray-600"
        >
           <span>View Repo</span>
           <ExternalLink size={12} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default RepoCard;
