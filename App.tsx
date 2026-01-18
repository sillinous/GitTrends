import React, { useState, useEffect } from 'react';
import Controls from './components/Controls';
import TrendsView from './components/TrendsView';
import PortfolioView from './components/PortfolioView';
import RepoDetailModal from './components/RepoDetailModal';
import { Repository, SearchState, PortfolioItem } from './types';
import { fetchTrendingRepos, generateTrendSummary } from './services/geminiService';
import { Bookmark, Loader2 } from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<'trends' | 'portfolio'>('trends');
  const [searchState, setSearchState] = useState<SearchState>({ topic: 'AI', days: 5, sortBy: 'trending' }); // Added sortBy
  const [repos, setRepos] = useState<Repository[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('gitTrendPortfolio');
    return saved ? JSON.parse(saved) : [];
  });

  // Save portfolio to local storage
  useEffect(() => {
    localStorage.setItem('gitTrendPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const handleSearch = async (newState: SearchState) => {
    setSearchState(newState);
    setLoading(true);
    setError(null);
    setActiveTab('trends');

    try {
      // Pass sortBy to fetchTrendingRepos
      const fetchedRepos = await fetchTrendingRepos(newState.topic, newState.days, newState.sortBy);
      setRepos(fetchedRepos);
      
      const generatedSummary = await generateTrendSummary(newState.topic, fetchedRepos);
      setSummary(generatedSummary);
      
    } catch (err: any) {
      if (err.status === 429 || err.code === 429 || err.message?.includes('RESOURCE_EXHAUSTED')) {
         setError("API Quota exceeded. Please wait a moment and try again.");
      } else {
         setError("Failed to fetch trending repositories. Please try again later.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleSearch(searchState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const togglePortfolioItem = (repo: Repository) => {
    setPortfolio(prev => {
      const exists = prev.find(p => p.url === repo.url);
      if (exists) {
        return prev.filter(p => p.url !== repo.url);
      } else {
        return [...prev, { ...repo, id: crypto.randomUUID(), addedAt: Date.now() }];
      }
    });
  };

  const removePortfolioItem = (id: string) => {
    setPortfolio(prev => prev.filter(item => item.id !== id));
  };

  const clearPortfolio = () => setPortfolio([]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30">
      <Controls 
        initialState={searchState} 
        onSearch={handleSearch} 
        isLoading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-6 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'trends' 
                ? 'text-cyan-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Discover Trends
            {activeTab === 'trends' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center ${
              activeTab === 'portfolio' 
                ? 'text-cyan-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Portfolio
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'portfolio' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-gray-800 text-gray-400'
            }`}>
              {portfolio.length}
            </span>
            {activeTab === 'portfolio' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-200 mb-6 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-cyan-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-cyan-500/80 animate-pulse">Analyzing GitHub trends...</p>
            </div>
          ) : (
            <>
              {activeTab === 'trends' && (
                <TrendsView 
                  repos={repos} 
                  portfolioItems={portfolio}
                  onTogglePortfolio={togglePortfolioItem}
                  onRepoClick={setSelectedRepo}
                  summary={summary}
                  topic={searchState.topic}
                />
              )}
              {activeTab === 'portfolio' && (
                <PortfolioView 
                  items={portfolio} 
                  onRemove={removePortfolioItem}
                  onRepoClick={setSelectedRepo}
                  onClear={clearPortfolio}
                />
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="border-t border-gray-900 mt-12 py-8 text-center text-gray-600 text-sm">
        <p>Powered by Google Gemini 3.0 &bull; Search Grounding enabled</p>
      </footer>

      {/* Repo Detail Modal */}
      {selectedRepo && (
        <RepoDetailModal 
          repo={selectedRepo} 
          onClose={() => setSelectedRepo(null)} 
        />
      )}
    </div>
  );
}

export default App;