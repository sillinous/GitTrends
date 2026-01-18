import React, { useEffect, useState, useRef } from 'react';
import { Repository, RepoAnalysis } from '../types';
import { 
  X, ExternalLink, Star, Code2, Activity, GitCommit, 
  Loader2, MessageSquare, TrendingUp, CheckCircle, GitFork, 
  Quote, Smile, Meh, Frown, Wand2, Copy, Check, 
  FileText, Clapperboard, Hash, Briefcase, Share2, Film
} from './Icons';
import { analyzeRepository, generateCreativeContent, generateVideoForRepo } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface RepoDetailModalProps {
  repo: Repository;
  onClose: () => void;
}

type ContentType = 'twitter' | 'linkedin' | 'blog' | 'video_script';

const ESTIMATED_VIDEO_DURATION_S = 120; // 2 minutes

const RepoDetailModal: React.FC<RepoDetailModalProps> = ({ repo, onClose }) => {
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyErrorMessage, setApiKeyErrorMessage] = useState('');
  const [showVideoConfirmation, setShowVideoConfirmation] = useState(false);
  const [videoProgress, setVideoProgress] = useState({ percent: 0, elapsed: 0 });
  const videoAbortController = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

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
      if (timerRef.current) clearInterval(timerRef.current);
      videoAbortController.current?.abort();
    };
  }, [repo]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleGenerateContent = async (type: ContentType) => {
    setGeneratedContent('');
    setVideoUrl(null);
    setContentType(type);
    setIsGenerating(true);
    try {
      const content = await generateCreativeContent(repo, type);
      setGeneratedContent(content);
    } catch (e) {
      console.error(e);
      setGeneratedContent("An error occurred while generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInitiateVideoGeneration = () => {
    setShowVideoConfirmation(true);
  };

  const handleCancelVideoGeneration = () => {
    videoAbortController.current?.abort();
  };

  const confirmAndGenerateVideo = async () => {
    setShowVideoConfirmation(false);
    setContentType(null);
    setGeneratedContent('');
    setVideoUrl(null);
    setShowApiKeyPrompt(false);
    setApiKeyErrorMessage('');
    setIsGeneratingVideo(true);
    setVideoProgress({ percent: 0, elapsed: 0 });

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      setVideoProgress(prev => {
        const newElapsed = prev.elapsed + 1;
        const newPercent = Math.min(95, (newElapsed / ESTIMATED_VIDEO_DURATION_S) * 100);
        return { percent: newPercent, elapsed: newElapsed };
      });
    }, 1000);

    const abortController = new AbortController();
    videoAbortController.current = abortController;

    try {
      const url = await generateVideoForRepo(repo, { signal: abortController.signal });
      setVideoUrl(url);
      setVideoProgress(prev => ({ ...prev, percent: 100 }));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Video generation cancelled by user.');
        // State is reset in finally block, no specific error message needed for cancellation
      } else if (error.message === "API_KEY_REQUIRED") {
        setShowApiKeyPrompt(true);
        setApiKeyErrorMessage("A paid API key is required for video generation (Veo model).");
      } else if (error.message === "API_KEY_INVALID") {
        setShowApiKeyPrompt(true);
        setApiKeyErrorMessage("The selected API key might be invalid or have billing issues.");
      } else {
        setShowApiKeyPrompt(true);
        setApiKeyErrorMessage(`Failed to generate video: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsGeneratingVideo(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleOpenSelectKey = async () => {
    setShowApiKeyPrompt(false);
    setApiKeyErrorMessage('');
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      confirmAndGenerateVideo();
    } else {
      setApiKeyErrorMessage("AI Studio key selection dialog not available in this environment.");
      setShowApiKeyPrompt(true);
    }
  };

  const copyToClipboard = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const getSentimentVisual = (score: number = 50) => {
    if (score >= 70) return { Icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (score >= 40) return { Icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    return { Icon: Frown, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const { Icon: SentimentIcon, color: sentColor, bg: sentBg, border: sentBorder } = getSentimentVisual(repo.sentimentScore);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      {showVideoConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowVideoConfirmation(false)}></div>
          <div className="relative bg-gray-850 border border-gray-700 rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-slide-up text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pink-500/10 border-4 border-pink-500/20 flex items-center justify-center">
              <Clapperboard size={32} className="text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Confirm Video Generation</h3>
            <p className="text-gray-400 mb-8">
              This process uses the Veo model, may take several minutes, and will use your paid API key quota.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowVideoConfirmation(false)} className="w-full px-4 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 font-semibold transition-colors">Cancel</button>
              <button onClick={confirmAndGenerateVideo} className="w-full px-4 py-3 rounded-lg bg-pink-600 text-white hover:bg-pink-500 font-semibold transition-colors">Confirm & Generate</button>
            </div>
          </div>
        </div>
      )}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up flex flex-col">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur z-10 p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-sm text-cyan-500 mb-1">
              <span>{repo.owner}</span>
              <span>/</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{repo.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center px-3 py-1.5 bg-gray-800 rounded-lg text-yellow-500 text-sm"><Star size={16} className="mr-2 fill-yellow-500" /><span className="font-semibold">{repo.stars} Stars</span></div>
            <div className="flex items-center px-3 py-1.5 bg-gray-800 rounded-lg text-cyan-500 text-sm"><Code2 size={16} className="mr-2" /><span className="font-semibold">{repo.language}</span></div>
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-1.5 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 rounded-lg text-sm transition-colors">View on GitHub <ExternalLink size={14} className="ml-2" /></a>
          </div>
          <div className="text-gray-300 leading-relaxed text-lg">{repo.description}</div>
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-purple-400"><Activity size={20} /><h3 className="font-bold text-lg uppercase tracking-wider">Deep Dive Analysis</h3></div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4"><Loader2 size={32} className="animate-spin text-cyan-500" /><p className="text-gray-500 animate-pulse">Scanning recent activity...</p></div>
            ) : analysis ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-white font-semibold mb-3 flex items-center"><Code2 size={16} className="mr-2 text-cyan-400" />Key Features</h4>
                  <ul className="space-y-2">{analysis.keyFeatures.map((feature, i) => (<li key={i} className="flex items-start text-gray-300 text-sm"><CheckCircle size={14} className="mt-0.5 mr-2 text-cyan-500 flex-shrink-0" /><span className="leading-tight">{feature}</span></li>))}</ul>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-white font-semibold mb-4 flex items-center"><TrendingUp size={16} className="mr-2 text-blue-400" />Commit Frequency (Last 30 Days)</h4>
                  <div className="h-48 w-full">{analysis.commitHistory && analysis.commitHistory.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><BarChart data={analysis.commitHistory}><CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} /><XAxis dataKey="week" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={30} /><Tooltip cursor={{ fill: 'rgba(55, 65, 81, 0.4)' }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6' }} /><Bar dataKey="commits" radius={[4, 4, 0, 0]}>{analysis.commitHistory.map((entry, index) => (<Cell key={`cell-${index}`} fill="#06b6d4" />))}</Bar></BarChart></ResponsiveContainer>) : (<div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm italic"><Activity size={24} className="mb-2 opacity-50" />Commit history data unavailable</div>)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-white font-semibold mb-3 flex items-center"><GitCommit size={16} className="mr-2 text-green-400" />Recent Activity & Updates</h4>
                  <ul className="space-y-3">{analysis.recentActivity.map((activity, i) => (<li key={i} className="flex items-start text-gray-300 text-sm border-l-2 border-gray-700 pl-3">{activity}</li>))}</ul>
                </div>
                {analysis.relatedRepos && analysis.relatedRepos.length > 0 && (<div className="bg-gray-800/50 rounded-xl p-5 border border-gray-800"><h4 className="text-white font-semibold mb-3 flex items-center"><GitFork size={16} className="mr-2 text-orange-400" />Related Repositories</h4><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{analysis.relatedRepos.map((related, i) => (<a key={i} href={related.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-900/50 border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50 rounded-lg transition-all group relative"><div className="flex justify-between items-start mb-1"><div className="flex items-center min-w-0 pr-2"><h5 className="font-medium text-cyan-400 group-hover:text-cyan-300 truncate" title={related.name}>{related.name}</h5><ExternalLink size={10} className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-500" /></div><span className="flex items-center text-xs text-yellow-500 flex-shrink-0 bg-yellow-500/10 px-1.5 py-0.5 rounded"><Star size={10} className="mr-1 fill-yellow-500" />{related.stars}</span></div><p className="text-xs text-gray-400 line-clamp-2" title={related.description}>{related.description}</p></a>))}</div></div>)}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border border-violet-500/20 p-6">
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 text-violet-500/10 pointer-events-none"><Quote size={64} /></div>
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h4 className="text-violet-400 font-semibold flex items-center text-lg"><MessageSquare size={18} className="mr-2" />Community Sentiment</h4>
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-bold border backdrop-blur-md shadow-lg ${sentBg} ${sentBorder} ${sentColor}`}><SentimentIcon size={16} className="mr-2" /><span className="mr-1">Score:</span>{repo.sentimentScore || 50}/100</div>
                  </div>
                  <blockquote className="relative z-10 text-gray-200 italic leading-relaxed text-base border-l-4 border-violet-500/40 pl-4 py-1">"{analysis.sentiment}"</blockquote>
                </div>
              </div>
            ) : (<div className="text-red-400 text-center py-8">Unable to load analysis details.</div>)}
            <div className="pt-6 border-t border-gray-800 animate-fade-in">
              <div className="flex items-center space-x-2 text-pink-400 mb-2">
                <Wand2 size={20} />
                <h3 className="font-bold text-lg uppercase tracking-wider">Creator Studio</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Select a format, like a Twitter post or technical blog, to generate marketing content.</p>

              <div className="bg-gray-800/30 rounded-xl border border-gray-800 overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-gray-800">
                  <button 
                    onClick={() => handleGenerateContent('twitter')}
                    className={`py-3 px-2 text-sm font-medium flex items-center justify-center transition-colors ${
                      contentType === 'twitter'
                        ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  ><Hash size={16} className="mr-2" /> Twitter</button>
                  <button onClick={() => handleGenerateContent('linkedin')} className={`py-3 px-2 text-sm font-medium flex items-center justify-center transition-colors ${contentType === 'linkedin' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}><Briefcase size={16} className="mr-2" /> LinkedIn</button>
                  <button onClick={() => handleGenerateContent('blog')} className={`py-3 px-2 text-sm font-medium flex items-center justify-center transition-colors ${contentType === 'blog' ? 'bg-gray-800 text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}><FileText size={16} className="mr-2" /> Blog</button>
                  <button onClick={() => handleGenerateContent('video_script')} className={`py-3 px-2 text-sm font-medium flex items-center justify-center transition-colors ${contentType === 'video_script' ? 'bg-gray-800 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}><Film size={16} className="mr-2" /> Video Script</button>
                  <button onClick={handleInitiateVideoGeneration} disabled={isGeneratingVideo} className={`py-3 px-2 text-sm font-medium flex items-center justify-center transition-colors ${isGeneratingVideo || videoUrl ? 'bg-gray-800 text-pink-400 border-b-2 border-pink-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>{isGeneratingVideo ? (<><Loader2 size={16} className="animate-spin mr-2" /> Gen. Video...</>) : (<><Clapperboard size={16} className="mr-2" /> Generate Video</>)}</button>
                </div>
                <div className="p-4 bg-gray-900/50 min-h-[200px] relative">
                  {showApiKeyPrompt && (<div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900/90 backdrop-blur-sm p-4 text-center"><Clapperboard size={48} className="text-pink-500 mb-4" /><p className="text-xl font-semibold text-white mb-3">Video Generation Requires a Paid API Key</p><p className="text-gray-300 mb-4">{apiKeyErrorMessage || "To generate videos using the Veo model, please select an API key from a Google Cloud Project with billing enabled."}</p><button onClick={handleOpenSelectKey} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] mb-3">Select API Key</button><p className="text-xs text-gray-500">Learn more about billing: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a></p><button onClick={() => setShowApiKeyPrompt(false)} className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"><X size={20} /></button></div>)}
                  {isGenerating ? (<div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 backdrop-blur-sm"><Loader2 size={32} className="animate-spin text-pink-500 mb-3" /><p className="text-sm text-pink-400 animate-pulse">Drafting content...</p></div>) : 
                   isGeneratingVideo ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/90 backdrop-blur-sm p-4 text-center">
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 max-w-xs"><div className="bg-pink-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${videoProgress.percent}%` }}></div></div>
                      <p className="text-lg font-semibold text-white mb-2">Generating video...</p>
                      <p className="text-sm text-pink-300 mb-6">Elapsed: {videoProgress.elapsed}s (This can take a few minutes)</p>
                      <button onClick={handleCancelVideoGeneration} className="px-4 py-2 rounded-lg bg-red-600/50 text-red-100 hover:bg-red-600 font-semibold transition-colors text-sm flex items-center"><X size={16} className="mr-2" />Cancel Generation</button>
                    </div>
                  ) : 
                   videoUrl ? (<div className="animate-fade-in flex flex-col items-center"><p className="text-gray-300 text-center mb-4">Your video is ready!</p><video src={videoUrl} controls className="w-full max-w-[500px] h-auto rounded-lg shadow-xl border border-gray-700" preload="metadata">Your browser does not support the video tag.</video><a href={videoUrl} download={`${repo.name}_video.mp4`} className="mt-4 flex items-center bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"><Share2 size={16} className="mr-2" /> Download Video</a></div>) : 
                   !contentType && !videoUrl ? (<div className="flex flex-col items-center justify-center h-48 text-gray-500"><Wand2 size={32} className="mb-3 opacity-30" /><p>Select a format above to generate content</p></div>) : 
                   (<div className="animate-fade-in relative group"><div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={copyToClipboard} className="flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium border border-gray-700 shadow-lg transition-all">{hasCopied ? (<><Check size={14} className="mr-1.5 text-green-400" />Copied!</>) : (<><Copy size={14} className="mr-1.5" />Copy</>)}</button></div><textarea readOnly value={generatedContent} className="w-full h-64 bg-transparent text-gray-300 text-sm font-mono leading-relaxed resize-none focus:outline-none scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-2" /></div>)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">{repo.tags.map((tag, idx) => (<span key={idx} className="px-3 py-1 text-xs font-medium bg-gray-950 border border-gray-800 text-gray-400 rounded-full">#{tag}</span>))}</div>
        </div>
      </div>
    </div>
  );
};

export default RepoDetailModal;