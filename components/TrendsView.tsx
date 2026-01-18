import React from 'react';
import { Repository, PortfolioItem } from '../types';
import RepoCard from './RepoCard';
import { TrendingUp } from './Icons';
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero / Summary Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-cyan-400 mb-2">
              <TrendingUp size={20} />
              <span className="font-semibold tracking-wide uppercase text-xs">AI Generated Insight</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 capitalize">{topic} Trends</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {summary}
            </p>
          </div>
          
          <div className="w-full md:w-64 h-32 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="text-center text-xs text-gray-500 -mt-2">Tech Stack Dist</div>
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
