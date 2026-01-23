
import React, { useState, useRef, useEffect } from 'react';
import { Repository, MultiRepoContentType } from '../types';
import { 
  X, Wand2, Loader2, Copy, Check, FileText, 
  Layout, Share2, Sparkles, Hash, Layers, Cpu,
  Rocket, Presentation, PieChartIcon, ShieldCheck, Users,
  Zap, Film, Clapperboard, Briefcase, MessageSquare, ExternalLink, Github
} from './Icons';
import { generateMultiRepoContent, generateMultiRepoVideo } from '../services/geminiService';

interface MultiRepoStudioModalProps {
  repos: Repository[];
  onClose: () => void;
}

const MultiRepoStudioModal: React.FC<MultiRepoStudioModalProps> = ({ repos, onClose }) => {
  const [activeType, setActiveType] = useState<MultiRepoContentType | 'social_reel_video'>('venture_opportunity');
  const [analysisCache, setAnalysisCache] = useState<Partial<Record<MultiRepoContentType | 'social_reel_video', string>>>({});
  const [isGenerating, setIsGenerating] = useState<MultiRepoContentType | 'social_reel_video' | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoMessage, setVideoMessage] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const displayedContent = analysisCache[activeType] || '';

  const loadingMessages = [
    "Synthesizing portfolio cross-references...",
    "Rendering cinematic 4K assets...",
    "Aligning technical narratives...",
    "Calibrating engagement heuristics...",
    "Optimizing visual flow...",
    "Finalizing neural export..."
  ];

  const handleGenerate = async (type: MultiRepoContentType | 'social_reel_video') => {
    if (isGenerating && isGenerating !== type) {
      abortControllerRef.current?.abort();
    }
    
    setActiveType(type);
    if (analysisCache[type]) return;

    setIsGenerating(type);
    abortControllerRef.current = new AbortController();

    try {
      if (type === 'social_reel_video') {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 5;
          if (progress > 95) progress = 95;
          setVideoProgress(progress);
          setVideoMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 3000);

        const url = await generateMultiRepoVideo(repos, { signal: abortControllerRef.current.signal });
        clearInterval(interval);
        setAnalysisCache(prev => ({ ...prev, [type]: url }));
      } else {
        const result = await generateMultiRepoContent(repos, type, { signal: abortControllerRef.current.signal });
        setAnalysisCache(prev => ({ ...prev, [type]: result }));
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setAnalysisCache(prev => ({ ...prev, [type]: "Synthesis failed. Please try a different vector." }));
      }
    } finally {
      setIsGenerating(null);
    }
  };
  
  useEffect(() => {
    handleGenerate('venture_opportunity');
    return () => abortControllerRef.current?.abort();
  }, []);

  const copyToClipboard = () => {
    if (displayedContent) {
      navigator.clipboard.writeText(displayedContent);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share && displayedContent) {
      navigator.share({
        title: `GitTrend Strategic Analysis - ${repos.length} Repositories`,
        text: displayedContent
      }).catch(console.error);
    }
  };

  const renderTextContent = (text: string) => {
    // If it's a social media preview, we wrap it in a platform-themed card
    if (activeType === 'linkedin_deepdive') {
      return (
        <div className="bg-[#0a66c2]/5 border border-[#0a66c2]/30 p-8 rounded-2xl relative">
           <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-[#0a66c2] rounded-full flex items-center justify-center text-white">
                 <Briefcase size={20} />
              </div>
              <div>
                 <div className="text-sm font-black text-[#0a66c2] uppercase">LinkedIn Professional Insight</div>
                 <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">B2B Authority Post Preview</div>
              </div>
           </div>
           <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
             {text}
           </div>
        </div>
      );
    }

    if (activeType === 'twitter_thread') {
       return (
         <div className="space-y-4">
           {text.split('\n\n').map((tweet, i) => (
             <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl relative group hover:border-sky-500/30 transition-all">
                <div className="absolute top-4 right-4 text-sky-500/20 group-hover:text-sky-500 transition-colors">
                   <Hash size={16} />
                </div>
                <div className="flex items-start space-x-4">
                   <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sky-400">
                      {i + 1}
                   </div>
                   <div className="flex-1">
                      <p className="text-sm text-gray-300 leading-relaxed">{tweet.replace(/^[0-9]\/|Tweet [0-9]:/i, '').trim()}</p>
                   </div>
                </div>
             </div>
           ))}
         </div>
       );
    }

    return text.split('\n').map((line, i) => {
      line = line.trim();
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="text-cyan-400 font-black text-lg mt-8 mb-3 uppercase tracking-tight">{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.match(/^[0-9]\./)) {
        return <div key={i} className="text-white font-bold text-md mt-6 mb-2">{line}</div>;
      }
      return <p key={i} className="mb-4 text-gray-400 font-light leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#050810] border border-gray-800 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        <div className="p-8 border-b border-gray-900 bg-gray-900/30 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-br from-indigo-900/40 to-cyan-900/20 rounded-2xl border border-cyan-500/20 text-cyan-400">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Portfolio Production Studio</h2>
              <p className="text-sm text-gray-500 font-medium">Transforming {repos.length} assets into high-performance media</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-80 flex-shrink-0 space-y-8">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Strategic Analysis</h3>
              <div className="space-y-2">
                {[
                  { id: 'venture_opportunity', label: 'VC Memo', icon: Rocket, color: 'text-cyan-400' },
                  { id: 'merger_acquisition_audit', label: 'M&A Audit', icon: ShieldCheck, color: 'text-violet-400' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleGenerate(mode.id as MultiRepoContentType)}
                    className={`w-full group flex items-center p-3 rounded-xl border text-left transition-all ${
                      activeType === mode.id ? 'bg-gray-900 border-cyan-500 shadow-lg' : 'bg-transparent border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gray-900 mr-3 ${mode.color}`}>
                      {isGenerating === mode.id ? <Loader2 size={16} className="animate-spin" /> : <mode.icon size={16} />}
                    </div>
                    <span className={`text-xs font-bold ${activeType === mode.id ? 'text-white' : 'text-gray-400'}`}>{mode.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Social Engagement</h3>
              <div className="space-y-2">
                {[
                  { id: 'linkedin_deepdive', label: 'LinkedIn Post', icon: Briefcase, color: 'text-blue-400' },
                  { id: 'twitter_thread', label: 'Twitter Thread', icon: Hash, color: 'text-sky-400' },
                  { id: 'technical_newsletter', label: 'Tech Newsletter', icon: FileText, color: 'text-emerald-400' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleGenerate(mode.id as MultiRepoContentType)}
                    className={`w-full group flex items-center p-3 rounded-xl border text-left transition-all ${
                      activeType === mode.id ? 'bg-gray-900 border-cyan-500 shadow-lg' : 'bg-transparent border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gray-900 mr-3 ${mode.color}`}>
                      {isGenerating === mode.id ? <Loader2 size={16} className="animate-spin" /> : <mode.icon size={16} />}
                    </div>
                    <span className={`text-xs font-bold ${activeType === mode.id ? 'text-white' : 'text-gray-400'}`}>{mode.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-2">Media Production</h3>
              <button
                onClick={() => handleGenerate('social_reel_video')}
                className={`w-full group flex items-center p-4 rounded-2xl border text-left transition-all bg-gradient-to-r from-pink-600/10 to-violet-600/10 ${
                  activeType === 'social_reel_video' ? 'border-pink-500 ring-1 ring-pink-500/20 shadow-xl' : 'border-gray-800 hover:border-pink-500/30'
                }`}
              >
                <div className={`p-3 rounded-xl bg-gray-900 mr-4 text-pink-500 shadow-inner`}>
                  {isGenerating === 'social_reel_video' ? <Loader2 size={24} className="animate-spin" /> : <Clapperboard size={24} />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black ${activeType === 'social_reel_video' ? 'text-white' : 'text-gray-400'}`}>Cinematic Reel</span>
                  <span className="text-[9px] text-pink-500 uppercase font-black tracking-tighter">AI Video Synth</span>
                </div>
              </button>
            </section>
          </div>

          <div className="flex-grow flex flex-col bg-gray-950/50 rounded-3xl border border-gray-900 overflow-hidden shadow-inner relative min-h-[600px]">
            <div className="p-4 border-b border-gray-900 flex justify-between items-center bg-gray-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Engine Output</span>
              </div>
              {displayedContent && activeType !== 'social_reel_video' && (
                <div className="flex items-center space-x-3">
                  <button onClick={handleNativeShare} className="text-[10px] font-black text-gray-500 hover:text-white uppercase flex items-center transition-colors">
                    <Share2 size={14} className="mr-2" />
                    Share
                  </button>
                  <button onClick={copyToClipboard} className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase flex items-center transition-colors">
                    {hasCopied ? <Check size={14} className="mr-2 text-emerald-400" /> : <Copy size={14} className="mr-2" />}
                    {hasCopied ? 'Copied' : 'Export Text'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-grow relative overflow-y-auto custom-scrollbar p-10">
              {isGenerating === activeType ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  {activeType === 'social_reel_video' ? (
                    <div className="w-full max-w-md">
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-500" style={{ width: `${videoProgress}%` }}></div>
                      </div>
                      <p className="text-pink-400 text-xs font-black uppercase tracking-widest mb-2 animate-pulse">{videoMessage}</p>
                      <p className="text-gray-600 text-[10px] font-mono tracking-tighter uppercase">Initializing Veo Multi-Asset Pipeline</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Loader2 size={48} className="animate-spin text-cyan-500 mb-6 opacity-20" />
                      <p className="text-cyan-500 text-xs font-black uppercase tracking-widest animate-pulse">Synthesizing Narrative...</p>
                    </div>
                  )}
                </div>
              ) : activeType === 'social_reel_video' && analysisCache['social_reel_video'] ? (
                <div className="animate-fade-in flex flex-col items-center justify-center h-full">
                  <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-[32px] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
                    <video 
                      src={analysisCache['social_reel_video']} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <p className="mt-8 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Social Portfolio Reel Generated Successfully</p>
                </div>
              ) : displayedContent ? (
                <div className="animate-fade-in max-w-3xl mx-auto py-4">
                  <div className="bg-gray-900/40 p-10 rounded-3xl border border-gray-800 shadow-2xl">
                    {renderTextContent(displayedContent)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <Cpu size={64} className="text-gray-700 mb-6" />
                  <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Select Vector to Begin Production</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-900 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             {repos.slice(0, 3).map(r => (
               <span key={r.name} className="px-2 py-1 bg-gray-950 border border-gray-800 rounded text-[9px] font-mono text-gray-500">{r.name}</span>
             ))}
             {repos.length > 3 && <span className="text-[9px] text-gray-700 font-black">+{repos.length - 3} MORE</span>}
          </div>
          <p className="text-[8px] text-gray-700 font-black uppercase tracking-[0.3em]">Proprietary Synthesis Pipeline &bull; Veo-3.1 &bull; Gemini-3.0 Pro</p>
        </div>
      </div>
    </div>
  );
};

export default MultiRepoStudioModal;
