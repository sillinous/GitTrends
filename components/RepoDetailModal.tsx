
import React, { useEffect, useState, useRef } from 'react';
import { Repository, RepoAnalysis } from '../types';
import { 
  X, ExternalLink, Star, Code2, Activity, 
  Loader2, TrendingUp, CheckCircle, GitFork, 
  Quote, Smile, Meh, Frown, Wand2, Copy, Check, 
  FileText, Clapperboard, Hash, Briefcase, Share2, Film,
  Map, Rocket, ShieldCheck, DollarSign, Users,
  Presentation, Cpu, TrendingDown, Zap, Hammer, AlertCircle,
  Layers, Github, Sparkles, Layout
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
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
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
    setContentType(type);
    try {
      const res = await generateCreativeContent(repo, type);
      setGeneratedContent(res);
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
          <div className="flex items-center space-x-2">
             <button onClick={() => window.open(repo.url, '_blank')} className="p-2.5 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-colors">
               <Github size={20} />
             </button>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors ml-2"><X size={28} /></button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
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
                
                <div className="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-16 bg-cyan-500/5 blur-[60px] pointer-events-none"></div>
                  <h4 className="text-white font-bold mb-6 flex items-center text-sm uppercase tracking-widest">
                    <Hammer size={16} className="mr-2 text-cyan-500" /> Strategic Technical Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis?.keyFeatures?.map((feature, i) => (
                      <div key={i} className="flex items-start space-x-3 p-4 bg-gray-800/20 rounded-xl border border-gray-800/50 hover:border-cyan-500/30 transition-all hover:bg-gray-800/40 group">
                        <div className="mt-1 flex-shrink-0">
                          <CheckCircle size={14} className="text-cyan-500 group-hover:scale-125 transition-transform" />
                        </div>
                        <span className="text-sm text-gray-300 leading-normal font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/10 p-6 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Generate Technical Deep-Dive</h4>
                      <p className="text-gray-400 text-xs">Transform this repository's architecture into a viral tech blog post.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleGenerate('blog_post')}
                    disabled={isGenerating}
                    className="flex items-center px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {isGenerating && contentType === 'blog_post' ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <FileText size={16} className="mr-2" />
                    )}
                    Generate Technical Blog
                  </button>
                </div>

                <section className="space-y-6">
                  <h4 className="text-white font-bold flex items-center text-sm uppercase tracking-widest">
                    <Briefcase size={16} className="mr-2 text-cyan-500" /> Strategic Business Valuation
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                    <div className="bg-gradient-to-b from-gray-900 to-[#0a0f18] p-6 rounded-2xl border border-gray-800">
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                        <AlertCircle size={14} className={`mr-2 ${getRiskColor(analysis?.businessValue?.maintenanceRisk)}`} /> Maintenance Risk
                      </h4>
                      <div className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                        {analysis?.businessValue?.maintenanceRisk || 'Unknown'}
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold leading-tight uppercase mb-4">
                        Bus Factor & Contribution Velocity
                      </p>
                      
                      {analysis?.businessValue?.maintenanceRiskFactors && analysis.businessValue.maintenanceRiskFactors.length > 0 && (
                        <div className="space-y-1.5 mt-4 pt-4 border-t border-gray-800/50">
                          {analysis.businessValue.maintenanceRiskFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-start text-[10px] text-gray-400 group">
                              <div className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full mr-2 transition-colors ${getRiskColor(analysis?.businessValue?.maintenanceRisk).replace('text-', 'bg-')}`} />
                              <span className="leading-tight">{factor}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

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

                  {analysis?.businessValue?.commercialAlternatives && analysis.businessValue.commercialAlternatives.length > 0 && (
                      <div className="bg-gray-950 p-8 rounded-3xl border border-gray-800 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-12 bg-rose-500/5 blur-[40px] pointer-events-none group-hover:bg-rose-500/10 transition-all"></div>
                          <div className="flex items-center justify-between mb-8">
                             <div>
                                <h4 className="text-white font-black text-lg tracking-tight uppercase">Commercial Displacement Analysis</h4>
                                <p className="text-gray-500 text-xs font-medium">Identifying primary market friction and build-vs-buy logic.</p>
                             </div>
                             <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest">Disruption Thesis</div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {analysis.businessValue.commercialAlternatives.map((alt, i) => (
                                  <div key={i} className="flex flex-col p-5 bg-gray-900/60 rounded-2xl border border-gray-800/80 hover:border-rose-500/30 transition-all hover:bg-gray-900">
                                      <div className="flex items-center justify-between mb-3">
                                         <span className="text-sm text-white font-bold">{alt}</span>
                                         <DollarSign size={14} className="text-rose-500" />
                                      </div>
                                      <div className="flex items-center space-x-2">
                                         <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500 w-[70%]" />
                                         </div>
                                         <span className="text-[9px] font-black text-gray-500 uppercase">Cost Burden</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-8 p-4 bg-rose-900/5 rounded-xl border border-rose-900/20 flex items-start space-x-4">
                             <AlertCircle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
                             <p className="text-xs text-rose-400 leading-relaxed italic">
                                "The integration of this repository directly erodes the unique value proposition of the aforementioned paid providers by lowering the architectural complexity and cost-of-entry for the specific {repo.language} ecosystem."
                             </p>
                          </div>
                      </div>
                  )}
                </section>

                <div className="bg-gray-900/50 p-6 rounded-2xl border border-cyan-500/20 shadow-xl overflow-hidden relative">
                  <h4 className="text-white font-bold mb-6 flex items-center text-sm uppercase tracking-wider">
                    <Film size={16} className="mr-2 text-pink-500" /> Cinematic Pitch Deck
                  </h4>

                  {showVideoConfirm && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-2xl z-20 animate-fade-in">
                      <Film size={32} className="text-pink-500 mb-4" />
                      <h3 className="text-xl font-black text-white mb-2">Confirm Video Generation</h3>
                      <p className="text-gray-400 text-center text-sm max-w-sm mb-6">
                        This will initiate the Veo AI model to generate a cinematic video. This process can take several minutes and is resource-intensive.
                      </p>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => setShowVideoConfirm(false)}
                          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowVideoConfirm(false);
                            handleGenerateVideo();
                          }}
                          className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                          Proceed
                        </button>
                      </div>
                    </div>
                  )}
                  
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
                  ) : videoUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
                      <video 
                        src={videoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                        poster={`https://opengraph.githubassets.com/1/${repo.owner}/${repo.name}`}
                      />
                    </div>
                  ) : (
                     <div className="text-center py-8">
                       <p className="text-gray-400 mb-4">Generate a dynamic video pitch for this project.</p>
                       <button 
                         onClick={() => setShowVideoConfirm(true)}
                         className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(219,39,119,0.3)]"
                       >
                         Generate Cinematic Pitch Video
                       </button>
                     </div>
                  )}
                </div>

                {analysis?.relatedRepos && analysis.relatedRepos.length > 0 && (
                  <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <h4 className="text-white font-bold mb-6 flex items-center text-sm uppercase tracking-wider">
                      <Layers size={16} className="mr-2 text-cyan-500" /> Ecosystem & Related Projects
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.relatedRepos.map((related, i) => {
                        const urlObj = new URL(related.url);
                        const owner = urlObj.pathname.split('/')[1] || 'unknown';
                        return (
                          <a 
                            key={i} 
                            href={related.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-gray-800/50 rounded-xl border border-gray-800 hover:border-cyan-500/30 transition-all group"
                          >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 pt-1">
                                    <Github size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate block">{related.name}</span>
                                    <p className="text-xs text-gray-500 mb-2">by <span className="text-cyan-600 font-semibold">{owner}</span></p>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{related.description}</p>
                                    <div className="flex items-center text-xs text-yellow-500">
                                        <Star size={12} className="mr-1 fill-yellow-500" />
                                        {related.stars} stars
                                    </div>
                                </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
             <div className="bg-[#0f172a] rounded-2xl border border-cyan-900/30 p-6 shadow-xl sticky top-[100px]">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center">
                  <Presentation size={16} className="mr-2 text-pink-500" /> Strategy Studio
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'pitch', label: 'ROI Pitch (Exec)', icon: Rocket },
                    { id: 'linkedin', label: 'Strategic B2B Update', icon: Briefcase },
                    { id: 'twitter', label: 'Viral Market Insight', icon: Hash },
                    { id: 'video_script', label: 'Viral Video Script', icon: Clapperboard },
                    { id: 'blog_post', label: 'Technical Blog Post', icon: FileText },
                  ].map(btn => (
                    <button 
                      key={btn.id}
                      onClick={() => handleGenerate(btn.id)}
                      disabled={isGenerating}
                      className={`w-full flex items-center p-3 border rounded-xl text-xs font-bold transition-all ${
                        contentType === btn.id 
                        ? 'bg-cyan-900/30 border-cyan-500 text-white' 
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500'
                      }`}
                    >
                      <btn.icon size={16} className={`mr-3 ${contentType === btn.id ? 'text-cyan-400' : 'text-pink-500'}`} />
                      {btn.label}
                    </button>
                  ))}
                </div>

                {isGenerating && (
                  <div className="mt-6 flex flex-col items-center">
                    <Loader2 size={24} className="animate-spin text-pink-500 mb-2" />
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest animate-pulse">Generating Asset...</span>
                  </div>
                )}
                
                {generatedContent && (
                  <div className="mt-6 animate-fade-in">
                    <div className="relative group">
                      <textarea 
                        readOnly 
                        value={generatedContent} 
                        className="w-full h-48 bg-gray-950 text-[11px] font-mono text-gray-400 p-4 rounded-xl border border-gray-800 focus:outline-none scrollbar-thin"
                      />
                      <div className="absolute bottom-2 right-2 flex space-x-2">
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: `Audit for ${repo.name}`, text: generatedContent });
                            }
                          }}
                          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-all"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={copyToClipboard}
                          className="p-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg border border-gray-700 transition-all"
                        >
                          {hasCopied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
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
    