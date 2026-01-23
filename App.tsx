
import React, { useState, useEffect } from 'react';
import Controls from './components/Controls';
import TrendsView from './components/TrendsView';
import PortfolioView from './components/PortfolioView';
import RepoDetailModal from './components/RepoDetailModal';
import MultiRepoStudioModal from './components/MultiRepoStudioModal';
import { Repository, SearchState, PortfolioItem } from './types';
import { fetchTrendingRepos, generateTrendSummary } from './services/geminiService';
import { AlertCircle, ExternalLink } from './components/Icons';

// Fix: Correctly extend global Window with AIStudio type to match existing system declarations
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Added readonly modifier to ensure all declarations of 'aistudio' have identical modifiers.
    readonly aistudio: AIStudio;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<'trends' | 'portfolio'>('trends');
  const [searchState, setSearchState] = useState<SearchState>({ topic: 'AI', days: 5, sortBy: 'trending' });
  const [repos, setRepos] = useState<Repository[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);
  
  // Modal State
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [studioRepos, setStudioRepos] = useState<Repository[] | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('gitTrendPortfolio');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gitTrendPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Mandatory: Check for API key selection on mount for Veo models
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsApiKey(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume selection successful after triggering per guidelines to avoid race condition
      setNeedsApiKey(false);
    }
  };

  const handleSearch = async (newState: SearchState) => {
    setSearchState(newState);
    setLoading(true);
    setError(null);
    setActiveTab('trends');

    try {
      const fetchedRepos = await fetchTrendingRepos(newState.topic, newState.days, newState.sortBy);
      setRepos(fetchedRepos);
      const generatedSummary = await generateTrendSummary(newState.topic, fetchedRepos);
      setSummary(generatedSummary);
    } catch (err: any) {
      // If the request fails with "Requested entity was not found.", prompt for key again
      if (err.message?.includes("Requested entity was not found.")) {
        setNeedsApiKey(true);
      }
      setError("Failed to fetch trending repositories. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(searchState);
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
      {/* Mandatory API Key Selection UI for Veo Video Generation */}
      {needsApiKey && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Strategic Access Required</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Veo video generation and high-quality image assets require a paid API key from a billing-enabled GCP project.
              </p>
            </div>
            
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-left">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-widest">Billing Documentation</span>
                <ExternalLink size={14} />
              </a>
            </div>

            <button
              onClick={handleSelectApiKey}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(8,145,178,0.3)]"
            >
              Select Paid API Key
            </button>
          </div>
        </div>
      )}

      <Controls 
        initialState={searchState} 
        onSearch={handleSearch} 
        isLoading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-6 border-b border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'trends' ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Discover Trends
            {activeTab === 'trends' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center ${
              activeTab === 'portfolio' ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            My Portfolio
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'portfolio' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-gray-800 text-gray-400'}`}>
              {portfolio.length}
            </span>
            {activeTab === 'portfolio' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-t-full" />}
          </button>
        </div>

        <div className="min-h-[400px]">
          {error && <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-200 mb-6">⚠️ {error}</div>}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-cyan-500 animate-spin"></div>
              <p className="text-cyan-500/80 animate-pulse text-sm">Analyzing GitHub trends...</p>
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
                  onLaunchStudio={setStudioRepos}
                />
              )}
            </>
          )}
        </div>
      </main>
      
      <footer className="border-t border-gray-900 mt-12 py-8 text-center text-gray-600 text-xs">
        <p>Built with Gemini 3 &bull; Multi-Repo Content Synthesis Enabled</p>
      </footer>

      {selectedRepo && (
        <RepoDetailModal 
          repo={selectedRepo} 
          onClose={() => setSelectedRepo(null)} 
        />
      )}

      {studioRepos && (
        <MultiRepoStudioModal 
          repos={studioRepos}
          onClose={() => setStudioRepos(null)}
        />
      )}
    </div>
  );
}

export default App;