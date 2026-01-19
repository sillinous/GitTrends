
import React, { useEffect, useState, useRef } from 'react';
import { Repository, RepoAnalysis } from '../types';
import { 
  X, ExternalLink, Star, Code2, Activity, 
  Loader2, TrendingUp, CheckCircle, GitFork, 
  Quote, Smile, Meh, Frown, Wand2, Copy, Check, 
  FileText, Clapperboard, Hash, Briefcase, Share2, Film,
  Map, Rocket, ShieldCheck, DollarSign, Users,
  Presentation, Cpu, TrendingDown, Zap, Hammer, AlertCircle
} from './Icons';
import { analyzeRepository, generateCreativeContent, generateVideoForRepo } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, AreaChart, Area } from 'recharts';

interface RepoDetailModalProps {
  repo: Repository;
  onClose: () => void;
}

const RepoDetailModal: React.FC<RepoDetailModalProps> = ({ repo, onClose }) => {
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  
  // Video specific state
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoMessage, setVideoMessage] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadingMessages = [
    "Initializing Veo Strategy Engine...",
    "Analyzing repository visual semantics...",
    "Synthesizing 3D dashboard assets...",
    "Rendering cinematic lighting layers...",
    "Encoding executive-level visual narrative...",
    "Optimizing for 720p neural output...",
    "Finalizing high-fidelity frames..."
  ];

  useEffect(() => {
    let mounted = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await analyzeRepository(repo);
        if (mounted) setAnalysis(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalysis();
    return () => { 
      mounted = false; 
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [repo]);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    setGeneratedContent('');
    try {
      const res = await generateCreativeContent(repo, type);
      setGeneratedContent(res);
      setContentType(type);
    } catch (e) {
      setGeneratedContent("Failed to generate strategic assets.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsVideoGenerating(true);
    setVideoProgress(0);
    setVideoUrl(null);
    abortControllerRef.current = new AbortController();

    // Progress simulation while waiting for API
    const progressInterval = setInterval(() => {
      setVideoProgress(prev => {
        if (prev >= 95) return prev;
        const inc = Math.random() * 2;
        return prev + inc;
      });
      setVideoMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 3000);

    try {
      const url = await generateVideoForRepo(repo, { signal: abortControllerRef.current.signal });
      setVideoUrl(url);
      setVideoProgress(100);
    } catch (e: any) {
      if (e.message !== 'Aborted') {
        alert("Video generation failed or timed out.");
      }
    } finally {
      clearInterval(progressInterval);
      setIsVideoGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const cancelVideoGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsVideoGenerating(false);
      setVideoProgress(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const getTrajectoryColor = (status: string = '') => {
    if (status.includes('Standard') || status.includes('Disruption')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status.includes('Stable')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getRiskColor = (risk: string = 'Medium') => {
    if (risk === 'Low') return 'text-emerald-400';
    if (risk === 'Medium') return 'text-yellow-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#0a0f18] border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        
        {/* Navigation / Header */}
        <div className="sticky top-0 bg-[#0a0f18]/95 backdrop-blur z-10 p-6 border-b border-gray-800 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Cpu size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-xs text-cyan-500 font-bold tracking-tighter uppercase">
                <a href={`https://github.com/${repo.owner}`} target="_blank" rel="noopener" className="hover:underline">{repo.owner}</a>
                <span className="text-gray-700">/</span>
                <span>Audit V3.2 - Strategic Intelligence</span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">{repo.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={28} /></button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Insights Column */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-yellow-500 font-bold shadow-sm">
                <Star size={18} className="mr-2 fill-yellow-500" />{repo.stars}
              </div>
              <div className="flex items-center px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-cyan-500 font-bold">
                <Code2 size={18} className="mr-2" />{repo.language}
              </div>
              {analysis?.businessValue?.marketTrajectory && (
                <div className={`flex items-center px-4 py-2 rounded-xl border font-bold ${getTrajectoryColor(analysis.businessValue.marketTrajectory)}`}>
                  <TrendingUp size={18} className="mr-2" />{analysis.businessValue.marketTrajectory}
                </div>
              )}
            </div>

            <p className="text-gray-400 text-xl leading-relaxed font-light">{repo.description}</p>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-6 text-cyan-500" size={40} />
                <p className="text-cyan-500 font-bold tracking-widest uppercase text-xs animate-pulse">Running Deep Strategic Audit...</p>
              </div>
            ) : (
              <div className="animate-fade-in space-y-12">
                
                {/* Strategic Technical Features */}
                <div className="bg-gray-900/30 p-6 rounded-2xl border border-gray-800">
                  <h4 className="text-white font-bold mb-4 flex items-center text-sm uppercase tracking-wider">
                    <Hammer size={16} className="mr-2 text-cyan-500" /> Strategic Technical Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis?.keyFeatures?.map((feature, i) => (
                      <div key={i} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-colors group">
                        <CheckCircle size={16} className="text-cyan-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-300 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dedicated Strategic Business Valuation Section */}
                <section className="space-y-6">
                  <h4 className="text-white font-bold flex items-center text-sm uppercase tracking-widest">
                    <Briefcase size={16} className="mr-2 text-cyan-500" /> Strategic Business Valuation
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Enterprise Score */}
                    <div className="bg-gradient-to-b from-gray-900 to-[#0a0f18] p-6 rounded-2xl border border-gray-800">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <ShieldCheck size={14} className="mr-2 text-emerald-500" /> Enterprise Readiness
                      </h4>
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-5xl font-black text-white">{analysis?.businessValue?.enterpriseReadiness}</span>
                        <span className="text-gray-600 font-bold">%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${analysis?.businessValue?.enterpriseReadiness}%` }}></div>
                      </div>
                    </div>

                    {/* Maintenance Risk (Bus Factor) */}
                    <div className="bg-gradient-to-b from-gray-900 to-[#0a0f18] p-6 rounded-2xl border border-gray-800">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <AlertCircle size={14} className={`mr-2 ${getRiskColor(analysis?.businessValue?.maintenanceRisk)}`} /> Maintenance Risk
                      </h4>
                      <div className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                        {analysis?.businessValue?.maintenanceRisk || 'Unknown'}
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold leading-tight uppercase">
                        Bus Factor & Contribution Velocity
                      </p>
                    </div>

                    {/* Monetization Score */}
                    <div className="bg-gradient-to-b from-gray-900 to-[#0a0f18] p-6 rounded-2xl border border-gray-800">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <Zap size={14} className="mr-2 text-yellow-500" /> SaaS Index
                      </h4>
                      <div className="flex items-baseline space-x-2 mb-2">
                        <span className="text-5xl font-black text-white">{analysis?.businessValue?.saasMonetizationScore || 0}</span>
                        <span className="text-gray-600 font-bold">pts</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${analysis?.businessValue?.saasMonetizationScore || 0}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ROI / Savings */}
                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <DollarSign size={14} className="mr-2 text-emerald-500" /> Estimated ROI
                      </h4>
                      <div>
                        <div className="text-2xl font-black text-white mb-1">{analysis?.businessValue?.estimatedSavings}</div>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Efficiency Savings / Yr</p>
                      </div>
                    </div>

                    {/* OpEx Estimation */}
                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <TrendingDown size={14} className="mr-2 text-rose-500" /> Cloud OpEx Forecast
                      </h4>
                      <div>
                        <div className="text-2xl font-black text-white mb-1">{analysis?.businessValue?.estimatedOpEx}</div>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Monthly Infrastructure</p>
                      </div>
                    </div>

                    {/* Licensing & Compliance */}
                    <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                        <FileText size={14} className="mr-2 text-blue-500" /> Licensing & Compliance
                      </h4>
                      <div>
                        <div className="text-xl font-black text-white mb-1 line-clamp-1">{analysis?.businessValue?.licensingNote}</div>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Legal Strategy / IP Risk</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Video Generation Section */}
                {videoUrl || isVideoGenerating ? (
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden relative">
                    <h4 className="text-white font-bold mb-6 flex items-center text-sm uppercase tracking-wider">
                      <Film size={16} className="mr-2 text-pink-500" /> Cinematic Pitch Deck
                    </h4>
                    
                    {isVideoGenerating ? (
                      <div className="flex flex-col items-center py-12">
                        <div className="w-full max-w-md bg-gray-800 h-2 rounded-full overflow-hidden mb-6">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-pink-500 h-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-500"
                            style={{ width: `${videoProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-cyan-400 text-xs font-black uppercase tracking-widest mb-2 animate-pulse">{videoMessage}</p>
                        <p className="text-gray-500 text-[10px] mb-8 font-mono">Estimated Time: ~2 mins | {Math.round(videoProgress)}% complete</p>
                        
                        <button 
                          onClick={cancelVideoGeneration}
                          className="px-6 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                        >
                          Terminate Process
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
                        <video 
                          src={videoUrl || ''} 
                          controls 
                          className="w-full h-full object-contain"
                          poster={`https://opengraph.githubassets.com/1/${repo.owner}/${repo.name}`}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Granular Telemetry Chart */}
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-white font-bold flex items-center text-sm uppercase tracking-wider">
                        <Activity size={16} className="mr-2 text-cyan-500" /> 
                        Momentum: Daily Granularity
                      </h4>
                      <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] text-cyan-400 font-black uppercase">
                        Active Window
                      </div>
                   </div>
                   <div className="h-56 w-full">
                      {analysis?.dailyMomentum && analysis.dailyMomentum.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analysis.dailyMomentum}>
                            <defs>
                              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="#4b5563" 
                              fontSize={10} 
                              axisLine={false} 
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke="#4b5563" 
                              fontSize={10} 
                              axisLine={false} 
                              tickLine={false} 
                            />
                            <Tooltip 
                              cursor={{ stroke: '#06b6d4', strokeWidth: 1 }} 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                              itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="commits" 
                              stroke="#06b6d4" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorCommits)" 
                              animationDuration={1500}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-600 py-10">Historical momentum data currently unavailable.</p>}
                   </div>
                   <p className="mt-4 text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
                     Signal indicates {analysis?.dailyMomentum?.reduce((acc, curr) => acc + curr.commits, 0) || 0} code iterations in the observation window.
                   </p>
                </div>
              </div>
            )}
          </div>

          {/* Business Studio Sidebar */}
          <div className="space-y-6">
             <div className="bg-[#0f172a] rounded-2xl border border-cyan-900/30 p-6 shadow-xl">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center">
                  <Presentation size={16} className="mr-2 text-pink-500" /> Strategy Studio
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'pitch', label: 'ROI Pitch (Exec)', icon: Rocket },
                    { id: 'linkedin', label: 'Strategic B2B Update', icon: Briefcase },
                    { id: 'twitter', label: 'Viral Market Insight', icon: Hash },
                    { id: 'blog_post', label: 'Technical Blog Post', icon: FileText },
                  ].map(btn => (
                    <button 
                      key={btn.id}
                      onClick={() => handleGenerate(btn.id)}
                      disabled={isGenerating}
                      className="w-full flex items-center p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-cyan-500 transition-all"
                    >
                      <btn.icon size={16} className="mr-3 text-pink-500" />
                      {btn.label}
                    </button>
                  ))}
                  
                  {/* Video Generator Button */}
                  <button 
                    onClick={handleGenerateVideo}
                    disabled={isVideoGenerating}
                    className="w-full flex items-center p-3 bg-gradient-to-r from-pink-900/20 to-violet-900/20 border border-pink-500/30 rounded-xl text-xs font-black text-pink-400 hover:text-white hover:border-pink-500 transition-all shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                  >
                    <Film size={16} className="mr-3 text-pink-500" />
                    Cinematic Pitch Video
                  </button>
                </div>

                {isGenerating && <div className="mt-6 flex justify-center"><Loader2 size={24} className="animate-spin text-pink-500" /></div>}
                
                {generatedContent && (
                  <div className="mt-6 animate-fade-in">
                    <div className="relative group">
                      <textarea 
                        readOnly 
                        value={generatedContent} 
                        className="w-full h-48 bg-gray-950 text-[11px] font-mono text-gray-400 p-4 rounded-xl border border-gray-800 focus:outline-none scrollbar-thin"
                      />
                      <button 
                        onClick={copyToClipboard}
                        className="absolute bottom-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg border border-gray-700 transition-all"
                      >
                        {hasCopied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
             </div>

             <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center">
                  <Users size={14} className="mr-2 text-amber-500" /> Ecosystem Talent
                </h3>
                <div className="space-y-4">
                  {analysis?.contributionInsights?.slice(0, 2).map((ins, i) => (
                    <div key={i} className="group">
                      <div className="text-[10px] font-black text-amber-500 mb-1 group-hover:text-amber-400 transition-colors uppercase">{ins.focusArea}</div>
                      <p className="text-[11px] text-gray-500 leading-tight">{ins.description}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoDetailModal;
