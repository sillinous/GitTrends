
import { GoogleGenAI, Type } from "@google/genai";
import { Repository, RepoAnalysis, MultiRepoContentType } from "../types";

const runWithRetry = async (fn: () => Promise<any>, retries = 6, baseDelay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isQuotaError = 
        error.status === 429 || 
        error.code === 429 || 
        errorMsg.includes('429') || 
        errorMsg.includes('RESOURCE_EXHAUSTED') ||
        errorMsg.includes('quota');
      
      if (isQuotaError && i < retries - 1) {
        const jitter = Math.random() * 1000;
        const waitTime = (baseDelay * Math.pow(2, i)) + jitter;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    recentActivity: { type: Type.ARRAY, items: { type: Type.STRING } },
    sentiment: { type: Type.STRING },
    commitHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.STRING },
          commits: { type: Type.INTEGER }
        }
      }
    },
    dailyMomentum: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          commits: { type: Type.INTEGER }
        }
      }
    },
    relatedRepos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING },
          description: { type: Type.STRING },
          stars: { type: Type.STRING }
        }
      }
    },
    contributionInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          difficulty: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    businessValue: {
      type: Type.OBJECT,
      properties: {
        maintenanceRisk: { type: Type.STRING },
        maintenanceRiskFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific factors contributing to the maintenance risk level (e.g., Low Bus Factor, Inactive Maintainers, Massive PR Backlog)" },
        estimatedSavings: { type: Type.STRING },
        enterpriseReadiness: { type: Type.NUMBER },
        licensingNote: { type: Type.STRING },
        estimatedOpEx: { type: Type.STRING },
        marketTrajectory: { type: Type.STRING },
        commercialAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
        saasMonetizationScore: { type: Type.NUMBER },
        securityHeuristic: { type: Type.STRING }
      },
      required: ["maintenanceRisk", "maintenanceRiskFactors", "estimatedSavings", "enterpriseReadiness", "licensingNote", "estimatedOpEx", "marketTrajectory", "commercialAlternatives", "saasMonetizationScore", "securityHeuristic"]
    }
  },
  required: ["keyFeatures", "recentActivity", "sentiment", "relatedRepos", "contributionInsights", "businessValue", "dailyMomentum"],
};

export const fetchTrendingRepos = async (topic: string, days: number, sortBy: 'trending' | 'newest' = 'trending'): Promise<Repository[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze GitHub to find top 12 ${sortBy} repositories for topic "${topic}" in the last ${days} days. 
    For each repo, provide: name, owner, description, url, language, stars, tags (string array), trendingScore (0-100), sentimentScore (0-100), 
    AND momentumHistory (an array of exactly 7 integers representing relative interest/stars gained over the last 7 days).
    Your entire response MUST be a single, valid JSON array.
    CRITICAL: Ensure all string values in the JSON output are properly escaped.`;

    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    }));

    let jsonText = response.text || "[]";
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonText.match(jsonRegex);
    if (match && match[1]) jsonText = match[1];
    return JSON.parse(jsonText.trim()) as Repository[];
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const generateTrendSummary = async (topic: string, repos: Repository[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Synthesize a business-centric market trend report for "${topic}" based on these projects: ${repos.map(r => r.name).join(", ")}.`;
    const response = await runWithRetry(() => ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: prompt 
    }));
    return response.text || `Executive overview of ${topic} ecosystem.`;
  } catch (e) {
    return `Analysis of ${topic} market trajectory.`;
  }
};

export const analyzeRepository = async (repo: Repository): Promise<RepoAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Deep Strategic Audit for "${repo.name}" by "${repo.owner}". 
    Evaluate all technical and business aspects. 
    Pay special attention to Maintenance Risk: Identify specific factors like contributor concentration, commit frequency, issue resolution time, and PR backlog.
    Return strictly as JSON.`;
    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json", 
        responseSchema: analysisSchema 
      },
    }));
    let jsonText = response.text || "{}";
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonText.match(jsonRegex);
    if (match && match[1]) jsonText = match[1];
    return JSON.parse(jsonText.trim()) as RepoAnalysis;
  } catch (error) {
    console.error("Deep audit error:", error);
    return {
      keyFeatures: ["Information Unavailable"],
      recentActivity: ["Metadata Fetch Failed"],
      sentiment: "Neutral",
      contributionInsights: [],
      relatedRepos: [],
      dailyMomentum: [],
      businessValue: {
        maintenanceRisk: "High",
        maintenanceRiskFactors: ["Data Fetch Failure"],
        estimatedSavings: "$0",
        enterpriseReadiness: 0,
        licensingNote: "Check GitHub",
        estimatedOpEx: "Unknown",
        marketTrajectory: "High-Risk Fad",
        commercialAlternatives: [],
        saasMonetizationScore: 0,
        securityHeuristic: "Critical: Not Evaluated"
      }
    };
  }
};

export const generateCreativeContent = async (repo: Repository, type: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let instruction = `Generate ${type} content for repository "${repo.name}" by ${repo.owner}. Focus on business value.`;
  
  if (type === 'blog_post') {
    instruction = `Generate a high-quality, professional TECHNICAL BLOG POST about the repository "${repo.name}" in Markdown.`;
  } else if (type === 'video_script') {
    instruction = `Generate a high-energy, engaging video script for TikTok/YouTube Shorts (60 seconds) about the repository "${repo.name}" by ${repo.owner}.
    Include:
    1. A strong "Hook" in the first 3 seconds (e.g., "Stop building X manually...").
    2. Quick explanation of the core problem it solves.
    3. Three rapid-fire features/benefits.
    4. Call to Action (CTA) to check out the repo.
    Format the script with clear visual cues [Visual] and spoken dialogue [Audio]. Keep it punchy and fast-paced for a developer/tech audience.`;
  } else if (type === 'pitch') {
    instruction = `Generate a persuasive Executive ROI Pitch for "${repo.name}". Focus on man-months saved and competitive edge.`;
  } else if (type === 'linkedin') {
    instruction = `Generate a high-impact B2B LinkedIn post about "${repo.name}" focusing on industry innovation and strategic value.`;
  } else if (type === 'twitter') {
    instruction = `Generate a viral-style X thread summary for "${repo.name}" with key technical highlights and why it matters.`;
  }

  const response = await runWithRetry(() => ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: instruction 
  }));
  return response.text || "Failed to generate assets.";
};

export const generateMultiRepoContent = async (repos: Repository[], type: MultiRepoContentType, options: { signal: AbortSignal }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const repoDetails = repos.map(r => `- ${r.name} (${r.owner}): ${r.description}`).join('\n');
  let prompt = `Analyze this portfolio:\n${repoDetails}\n\n`;

  switch (type) {
    case 'linkedin_deepdive':
      prompt += "Act as a Technical Thought Leader. Generate a high-impact LinkedIn post. Highlight the 'Strategic Convergence' of these projects. Use bold headers, emojis for engagement, and a clear call to action regarding technical innovation. Focus on authority and industry trends.";
      break;
    case 'twitter_thread':
      prompt += "Generate a viral 7-tweet thread for a developer audience. Each tweet must be information-dense and provide a 'Value Bomb'. The thread should build narrative tension about why this specific stack is the future of the ecosystem.";
      break;
    case 'technical_newsletter':
      prompt += "Generate a 'Tech Radar' newsletter entry. Categorize these projects into 'Adopt', 'Trial', and 'Assess'. Provide concise technical justifications for each categorization based on market momentum and architectural novelty.";
      break;
    case 'venture_opportunity':
      prompt += "Produce a GP-level VC Investment Memo. Include Market Alpha, GTM Strategy, ARR Projections, and Defensible Moats.";
      break;
    case 'merger_acquisition_audit':
      prompt += "Generate a Corporate Development M&A Audit. Evaluate strategic IP fit and Build vs Buy calculus.";
      break;
    default:
      prompt += `Generate an executive ${type} summary.`;
  }

  const abortableRun = () => new Promise<any>(async (resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
    options.signal.addEventListener('abort', onAbort);
    try {
      const result = await runWithRetry(() => ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { systemInstruction: "You are a world-class Strategist and Content Creator. Your output is professional, quantitative, and tailored for high-engagement professional social platforms." }
      }));
      resolve(result);
    } catch (error) { reject(error); } finally { options.signal.removeEventListener('abort', onAbort); }
  });
  
  const response = await abortableRun();
  return response.text || "Strategic synthesis failed.";
};

export const generateVideoForRepo = async (repo: Repository, options: { signal: AbortSignal }): Promise<string> => {
  const currentAiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await currentAiInstance.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A sleek, cinematic business presentation video for the software project ${repo.name}. Show professional dashboards, coding interfaces, and growth charts in 3D.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
  });
  while (!operation.done) {
    if (options.signal.aborted) throw new Error('Aborted');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await currentAiInstance.operations.getVideosOperation({ operation: operation });
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};

export const generateMultiRepoVideo = async (repos: Repository[], options: { signal: AbortSignal }): Promise<string> => {
  const currentAiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const repoNames = repos.map(r => r.name).join(", ");
  let operation = await currentAiInstance.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A cinematic portfolio reel for a venture firm. Show a digital vault opening to reveal glowing logos of ${repoNames}. Montage of futuristic network graphs, satellite data visualizations, and high-speed code scrolls. Cinematic blue and gold lighting. 1080p executive style.`,
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '9:16' }
  });
  while (!operation.done) {
    if (options.signal.aborted) throw new Error('Aborted');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await currentAiInstance.operations.getVideosOperation({ operation: operation });
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};
