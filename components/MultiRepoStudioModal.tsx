
import React, { useState } from 'react';
import { Repository, MultiRepoContentType } from '../types';
import { 
  X, Wand2, Loader2, Copy, Check, FileText, 
  Layout, Share2, Sparkles, Hash, Layers, Cpu,
  Rocket, Presentation, PieChartIcon, ShieldCheck, Users,
  Zap
} from './Icons';
import { generateMultiRepoContent } from '../services/geminiService';

interface MultiRepoStudioModalProps {
  repos: Repository[];
  onClose: () => void;
}

const MultiRepoStudioModal: React.FC<MultiRepoStudioModalProps> = ({ repos, onClose }) => {
  const [activeType, setActiveType] = useState<MultiRepoContentType | null>(null);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerate = async (type: MultiRepoContentType) => {
    setActiveType(type);
    setIsGenerating(true);
    setContent('');
    try {
      const result = await generateMultiRepoContent(repos, type);
      setContent(result);
    } catch (e) {
      setContent("Strategic synthesis engine failed. Please try a different analysis vector.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#050810] border border-gray-800 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up flex flex-col">
        
        {/* Header - Enterprise Branding */}
        <div className="p-8 border-b border-gray-900 bg-gray-900/30 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-cyan-900/20 rounded-2xl border border-cyan-500/20 text-cyan-400">
              <PieChartIcon size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Venture Capital & Strategy Lab</h2>
              <p className="text-sm text-gray-500 font-medium">Synthesizing {repos.length} repos into Multi-Million Dollar Opportunities</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Analysis Vectors (Left Rail) */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 px-2">Strategic Vectors</h3>
            
            {[
              { id: 'venture_opportunity', label: 'VC Opportunity Analysis', icon: Rocket, color: 'text-cyan-400', desc: 'SaaS Blueprints & ARR Projections' },
              { id: 'merger_acquisition_audit', label: 'M&A Due Diligence', icon: ShieldCheck, color: 'text-violet-400', desc: 'Acquisition & IP Evaluation' },
              { id: 'talent_acquisition_roadmap', label: 'Talent Lead Map', icon: Users, color: 'text-amber-400', desc: 'Contributor Skill Scarcity' },
              { id: 'stakeholder_pitch', label: 'Corporate ROI Deck', icon: Presentation, color: 'text-emerald-400', desc: 'Board-Level Value Narrative' },
              { id: 'architecture_blueprint', label: 'System Integration', icon: Layers, color: 'text-rose-400', desc: 'Enterprise Implementation' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleGenerate(mode.id as MultiRepoContentType)}
                disabled={isGenerating}
                className={`w-full group flex items-center p-4 rounded-2xl border text-left transition-all ${
                  activeType === mode.id 
                    ? 'bg-gray-900 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                    : 'bg-transparent border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gray-900 mr-4 group-hover:scale-110 transition-transform ${mode.color}`}>
                  <mode.icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${activeType === mode.id ? 'text-white' : 'text-gray-400'}`}>{mode.label}</span>
                  <span className="text-[9px] text-gray-600 uppercase font-black">{mode.desc}</span>
                </div>
              </button>
            ))}
            
            <div className="pt-8 px-2 border-t border-gray-900 mt-8">
              <h3 className="text-[10px] font-black uppercase text-gray-600 mb-4">Portfolio Context</h3>
              <div className="space-y-2">
                {repos.map(r => (
                  <div key={r.name} className="flex items-center text-[11px] text-gray-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-3"></span>
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intelligence Output Area */}
          <div className="flex-grow flex flex-col bg-gray-950/50 rounded-3xl border border-gray-900 overflow-hidden min-h-[500px] shadow-inner">
            <div className="p-5 border-b border-gray-900 flex justify-between items-center bg-gray-900/20">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Synthesized Intelligence Layer</span>
                {activeType === 'venture_opportunity' && (
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-black border border-cyan-500/20 rounded uppercase">VC Alpha Grade</span>
                )}
              </div>
              {content && (
                <button 
                  onClick={copyToClipboard} 
                  className="text-xs font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-tighter transition-colors flex items-center"
                >
                  <Copy size={14} className="mr-2" />
                  {hasCopied ? 'Export Complete' : 'Export Insight'}
                </button>
              )}
            </div>

            <div className="flex-grow relative p-10 overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative mb-8">
                    <Loader2 size={64} className="animate-spin text-cyan-500 opacity-20" />
                    <Cpu size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" />
                  </div>
                  <p className="text-cyan-500 text-sm font-black tracking-widest uppercase animate-pulse text-center">
                    Running Venture Simulations...<br/>
                    Quantifying Market Scarcity...
                  </p>
                </div>
              ) : content ? (
                <div className="animate-fade-in font-sans text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  <div className="bg-gradient-to-br from-gray-900 to-transparent p-8 rounded-3xl border border-gray-800 shadow-xl prose prose-invert max-w-none">
                    {content.split('\n').map((line, i) => {
                       // Basic styling for headers in the response
                       if (line.match(/^[0-9]\.|^#|^\*\*/)) {
                         return <div key={i} className="text-cyan-400 font-black text-lg mt-6 mb-2 uppercase tracking-tight">{line.replace(/^\*\*|\*\*$/g, '')}</div>;
                       }
                       return <p key={i} className="mb-2 text-gray-400">{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 shadow-xl opacity-20">
                    <Zap size={32} className="text-gray-500" />
                  </div>
                  <p className="text-center text-gray-600 font-bold tracking-tight">
                    Select a strategic vector to<br/>synthesize your portfolio stacks.
                  </p>
                  
                  {/* Dedicated Quick Start Button */}
                  <button 
                    onClick={() => handleGenerate('venture_opportunity')}
                    className="mt-8 flex items-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.2)] group"
                  >
                    <Rocket size={20} className="mr-3 group-hover:animate-bounce" />
                    Generate Venture Opportunity
                  </button>
                  <p className="mt-4 text-[10px] text-gray-700 font-black uppercase tracking-widest">Market Gap & ARR Analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="p-4 bg-gray-900/50 border-t border-gray-900 text-center flex items-center justify-center space-x-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">Gemini 3.0 Pro Strategy Engine &bull; VC Logic Layer &bull; Grounded Real-world Context</p>
        </div>
      </div>
    </div>
  );
};

export default MultiRepoStudioModal;
