import React, { useState } from 'react';
import { SearchState } from '../types';
import { Search, Loader2 } from './Icons';

interface ControlsProps {
  initialState: SearchState;
  onSearch: (state: SearchState) => void;
  isLoading: boolean;
}

const Controls: React.FC<ControlsProps> = ({ initialState, onSearch, isLoading }) => {
  const [topic, setTopic] = useState(initialState.topic);
  const [days, setDays] = useState(initialState.days);
  const [sortBy, setSortBy] = useState(initialState.sortBy || 'trending'); // New state for sortBy

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ topic, days, sortBy }); // Pass sortBy to onSearch
  };

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
              GT
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block">
              GitTrend AI
            </h1>
          </div>

          <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic (e.g. AI, React, Web3)..."
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all placeholder-gray-600"
              />
            </div>
            
            <div className="flex rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setSortBy('trending')}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === 'trending' 
                            ? 'bg-cyan-600 text-white shadow-inner shadow-black/20' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                    title="Sort by trending repositories"
                >
                    Trending
                </button>
                <button
                    type="button"
                    onClick={() => setSortBy('newest')}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === 'newest' 
                            ? 'bg-cyan-600 text-white shadow-inner shadow-black/20' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                    title="Sort by newest repositories"
                >
                    Newest
                </button>
            </div>

            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-gray-950 border border-gray-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>2 Weeks</option>
              <option value={30}>1 Month</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                'Discover'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Controls;