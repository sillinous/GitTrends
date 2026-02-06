
import React, { useState, useMemo, useRef } from 'react';
import { Repository, PortfolioItem, RadarRing } from '../types';
import { Target, Bookmark, BookmarkCheck, Star, Code2, Zap } from './Icons';

const RING_CONFIG = [
  { id: 'adopt' as RadarRing, label: 'Adopt', outerR: 60, color: '#10b981', desc: 'Strong momentum & sentiment. Safe to adopt now.' },
  { id: 'trial' as RadarRing, label: 'Trial', outerR: 120, color: '#06b6d4', desc: 'Worth experimenting with on non-critical projects.' },
  { id: 'assess' as RadarRing, label: 'Assess', outerR: 180, color: '#f59e0b', desc: 'Interesting. Explore to understand fit for your needs.' },
  { id: 'hold' as RadarRing, label: 'Hold', outerR: 230, color: '#ef4444', desc: 'Proceed with caution. Low momentum or mixed signals.' },
];

const LANG_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa'];
const CENTER = 250;

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function classifyRepo(repo: Repository): RadarRing {
  const score = (repo.trendingScore || 50) * 0.6 + (repo.sentimentScore || 50) * 0.4;
  if (score >= 75) return 'adopt';
  if (score >= 55) return 'trial';
  if (score >= 35) return 'assess';
  return 'hold';
}

function getCompositeScore(repo: Repository): number {
  return Math.round((repo.trendingScore || 50) * 0.6 + (repo.sentimentScore || 50) * 0.4);
}

interface TechRadarViewProps {
  repos: Repository[];
  portfolioItems: PortfolioItem[];
  onTogglePortfolio: (repo: Repository) => void;
  onRepoClick: (repo: Repository) => void;
  topic: string;
}

const TechRadarView: React.FC<TechRadarViewProps> = ({
  repos, portfolioItems, onTogglePortfolio, onRepoClick, topic
}) => {
  const [hoveredRepoName, setHoveredRepoName] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ repo: Repository; x: number; y: number } | null>(null);
  const [activeRing, setActiveRing] = useState<RadarRing | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = useMemo(() => [...new Set(repos.map(r => r.language))], [repos]);

  const getLangColor = (lang: string) => LANG_COLORS[languages.indexOf(lang) % LANG_COLORS.length];

  const radarItems = useMemo(() => {
    const grouped: Record<RadarRing, Repository[]> = { adopt: [], trial: [], assess: [], hold: [] };
    repos.forEach(repo => grouped[classifyRepo(repo)].push(repo));

    const items: Array<{ repo: Repository; ring: RadarRing; x: number; y: number; score: number }> = [];

    RING_CONFIG.forEach((ring, ringIdx) => {
      const innerR = ringIdx === 0 ? 0 : RING_CONFIG[ringIdx - 1].outerR;
      const midR = (innerR + ring.outerR) / 2;
      const ringRepos = grouped[ring.id];
      const count = ringRepos.length;

      ringRepos.forEach((repo, i) => {
        const hash = hashCode(repo.name + repo.owner);
        const angleStep = (2 * Math.PI) / Math.max(count, 1);
        const angle = -Math.PI / 2 + i * angleStep;
        const maxJitter = (ring.outerR - innerR) / 4;
        const radiusJitter = ((hash % 20) - 10) / 10 * maxJitter;
        const r = Math.max(innerR + 8, Math.min(ring.outerR - 8, midR + radiusJitter));

        items.push({
          repo,
          ring: ring.id,
          score: getCompositeScore(repo),
          x: CENTER + r * Math.cos(angle),
          y: CENTER + r * Math.sin(angle),
        });
      });
    });
    return items;
  }, [repos]);

  const ringCounts = useMemo(() => {
    const counts: Record<string, number> = { adopt: 0, trial: 0, assess: 0, hold: 0 };
    radarItems.forEach(item => counts[item.ring]++);
    return counts;
  }, [radarItems]);

  const handleDotHover = (item: typeof radarItems[0], e: React.MouseEvent<SVGElement>) => {
    setHoveredRepoName(item.repo.name);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        repo: item.repo,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
      });
    }
  };

  const handleDotLeave = () => {
    setHoveredRepoName(null);
    setTooltip(null);
  };

  const isBookmarked = (url: string) => portfolioItems.some(p => p.url === url);

  const filteredItems = activeRing ? radarItems.filter(i => i.ring === activeRing) : radarItems;

  const getDotRadius = (stars: string) => {
    const num = parseInt(stars.replace(/[^0-9]/g, '')) || 0;
    if (num >= 10000) return 10;
    if (num >= 1000) return 8;
    if (num >= 100) return 6;
    return 5;
  };

  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Target size={48} className="opacity-30 mb-4" />
        <p className="text-sm">Search for a topic to populate the Tech Radar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <Target size={20} />
            <span className="font-semibold uppercase text-[10px] tracking-widest">Technology Radar</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2 capitalize tracking-tight">{topic} Tech Radar</h2>
          <p className="text-gray-400 text-sm font-light">
            Repositories classified by adoption readiness based on trending momentum and community sentiment.
          </p>

          {/* Ring filter chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveRing(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                !activeRing ? 'bg-gray-700 border-gray-600 text-white' : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600'
              }`}
            >
              All ({repos.length})
            </button>
            {RING_CONFIG.map(ring => (
              <button
                key={ring.id}
                onClick={() => setActiveRing(activeRing === ring.id ? null : ring.id)}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all"
                style={
                  activeRing === ring.id
                    ? { color: ring.color, borderColor: ring.color, backgroundColor: ring.color + '15' }
                    : { color: '#6b7280', borderColor: '#1f2937' }
                }
              >
                {ring.label} ({ringCounts[ring.id]})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SVG Radar */}
        <div className="flex-1 relative" ref={containerRef}>
          <div className="bg-[#0a0f18] rounded-2xl border border-gray-800 p-4 overflow-hidden">
            <svg viewBox="0 0 500 500" className="w-full h-auto max-h-[600px]">
              {/* Ring fills - draw outermost first so innermost paints on top */}
              {[...RING_CONFIG].reverse().map(ring => (
                <circle
                  key={`fill-${ring.id}`}
                  cx={CENTER} cy={CENTER} r={ring.outerR}
                  fill={ring.color}
                  fillOpacity={0.04}
                  stroke={ring.color}
                  strokeOpacity={0.15}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* Cross-hair lines */}
              <line x1={CENTER} y1={20} x2={CENTER} y2={480} stroke="#1f2937" strokeWidth={0.5} />
              <line x1={20} y1={CENTER} x2={480} y2={CENTER} stroke="#1f2937" strokeWidth={0.5} />
              <line x1={CENTER - 170} y1={CENTER - 170} x2={CENTER + 170} y2={CENTER + 170} stroke="#111827" strokeWidth={0.5} />
              <line x1={CENTER + 170} y1={CENTER - 170} x2={CENTER - 170} y2={CENTER + 170} stroke="#111827" strokeWidth={0.5} />

              {/* Ring labels along the right axis */}
              {RING_CONFIG.map((ring, i) => {
                const innerR = i === 0 ? 0 : RING_CONFIG[i - 1].outerR;
                const labelR = (innerR + ring.outerR) / 2;
                return (
                  <text
                    key={`label-${ring.id}`}
                    x={CENTER + labelR}
                    y={CENTER - 4}
                    fill={ring.color}
                    fillOpacity={0.5}
                    fontSize={8}
                    fontWeight={900}
                    textAnchor="middle"
                    style={{ textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}
                  >
                    {ring.label}
                  </text>
                );
              })}

              {/* Center dot */}
              <circle cx={CENTER} cy={CENTER} r={3} fill="#10b981" fillOpacity={0.6} />

              {/* Repo dots */}
              {radarItems.map((item, i) => {
                const isActive = !activeRing || item.ring === activeRing;
                const isHovered = hoveredRepoName === item.repo.name;
                const dotR = getDotRadius(item.repo.stars);
                const langColor = getLangColor(item.repo.language);

                return (
                  <g key={`dot-${item.repo.name}-${i}`}>
                    {isHovered && (
                      <circle
                        cx={item.x} cy={item.y} r={dotR + 8}
                        fill={langColor}
                        fillOpacity={0.2}
                      >
                        <animate attributeName="r" values={`${dotR + 6};${dotR + 10};${dotR + 6}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="fill-opacity" values="0.2;0.1;0.2" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={item.x} cy={item.y} r={dotR}
                      fill={langColor}
                      fillOpacity={isActive ? 0.9 : 0.12}
                      stroke={isHovered ? '#ffffff' : 'none'}
                      strokeWidth={isHovered ? 2 : 0}
                      className="cursor-pointer"
                      style={{ transition: 'fill-opacity 0.2s, stroke-width 0.2s' }}
                      onMouseEnter={(e) => handleDotHover(item, e)}
                      onMouseLeave={handleDotLeave}
                      onClick={() => onRepoClick(item.repo)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl min-w-[200px]">
                <div className="text-sm font-bold text-white">{tooltip.repo.name}</div>
                <div className="text-[10px] text-gray-500 mb-2">{tooltip.repo.owner}</div>
                <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{tooltip.repo.description}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span className="flex items-center"><Star size={10} className="mr-1 text-yellow-500" />{tooltip.repo.stars}</span>
                  <span className="flex items-center"><Code2 size={10} className="mr-1 text-cyan-500" />{tooltip.repo.language}</span>
                  <span className="flex items-center"><Zap size={10} className="mr-1 text-pink-500" />{tooltip.repo.trendingScore}</span>
                </div>
              </div>
            </div>
          )}

          {/* Language Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {languages.map(lang => (
              <div key={lang} className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLangColor(lang) }}></div>
                <span className="text-[10px] text-gray-500 font-medium">{lang}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Repo list grouped by ring */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6 max-h-[700px] overflow-y-auto pr-1">
          {RING_CONFIG.map(ring => {
            const ringItems = filteredItems.filter(i => i.ring === ring.id);
            if (ringItems.length === 0) return null;

            return (
              <div key={ring.id}>
                <div className="flex items-center space-x-2 mb-2 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }}></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: ring.color }}>
                    {ring.label}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">{ringItems.length}</span>
                </div>
                <p className="text-[9px] text-gray-600 mb-3 px-1">{ring.desc}</p>

                <div className="space-y-2">
                  {ringItems
                    .sort((a, b) => b.score - a.score)
                    .map((item, i) => (
                    <div
                      key={`list-${item.repo.name}-${i}`}
                      onClick={() => onRepoClick(item.repo)}
                      onMouseEnter={() => setHoveredRepoName(item.repo.name)}
                      onMouseLeave={() => setHoveredRepoName(null)}
                      className={`group p-3 bg-gray-900 border rounded-xl cursor-pointer transition-all ${
                        hoveredRepoName === item.repo.name
                          ? 'border-gray-600 bg-gray-800/50'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {item.repo.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{item.repo.owner}</div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ color: ring.color, backgroundColor: ring.color + '15' }}
                          >
                            {item.score}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onTogglePortfolio(item.repo); }}
                            className={`p-1 rounded transition-colors ${
                              isBookmarked(item.repo.url) ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                            }`}
                          >
                            {isBookmarked(item.repo.url) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-[10px] text-gray-500">
                        <span className="flex items-center">
                          <Star size={9} className="mr-1 text-yellow-500/60" />{item.repo.stars}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: getLangColor(item.repo.language) }}></span>
                          {item.repo.language}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechRadarView;
