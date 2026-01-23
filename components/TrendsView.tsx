
import React, { useState } from 'react';
import { Repository, PortfolioItem } from '../types';
import RepoCard from './RepoCard';
import { TrendingUp, ChevronDown } from './Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TrendsViewProps {
  repos: Repository[];
  portfolioItems: PortfolioItem[];
  onTogglePortfolio: (repo: Repository) => void;
  onRepoClick: (repo: Repository) => void;
  summary: string;
  topic: string;
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const TrendsView: React.FC<TrendsViewProps> = ({ 
  repos, 
  portfolioItems, 
  onTogglePortfolio, 
  onRepoClick,
  summary,
  topic
}) => {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  
  // Calculate language distribution for chart
  const languageData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    repos.forEach(r => {
      counts[r.language] = (counts[r.language] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [repos]);

  const isBookmarked = (repoUrl: string) => {
    return portfolioItems.some(item => item.url === repoUrl);
  };

  if (repos.length === 0) return null;

  const canExpand = summary.length > 200;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero / Summary Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <TrendingUp size={20} />
              <span className="font-semibold tracking-wide uppercase text-[10px] tracking-widest">AI Market Pulse</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 capitalize tracking-tight">{topic} Intelligence Report</h2>
            
            <div 
              className="relative text-gray-300 text-lg leading-relaxed transition-[max-height] duration-700 ease-in-out overflow-hidden"
              style={{ maxHeight: isSummaryExpanded ? '1000px' : '84px' }}
            >
              <p className="font-light">{summary}</p>
              {!isSummaryExpanded && canExpand && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent pointer-events-none" />
              )}
            </div>
            
            {canExpand && (
              <button 
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="text-cyan-500 hover:text-cyan-400 text-xs font-black uppercase tracking-widest mt-6 flex items-center group transition-colors"
              >
                <span>{isSummaryExpanded ? 'Collapse Insight' : 'Expand Strategic Context'}</span>
                <ChevronDown size={14} className={`ml-2 transform transition-transform duration-300 ${isSummaryExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          <div className="w-full md:w-64 h-32 flex-shrink-0 bg-gray-950/30 rounded-xl p-2 border border-gray-700/50">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="text-center text-[9px] font-black text-gray-600 uppercase tracking-widest -mt-1">Stack Variance</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo, idx) => (
          <RepoCard 
            key={`${repo.name}-${idx}`} 
            repo={repo} 
            delay={idx * 100}
            onBookmark={onTogglePortfolio}
            onClick={onRepoClick}
            isBookmarked={isBookmarked(repo.url)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrendsView;
