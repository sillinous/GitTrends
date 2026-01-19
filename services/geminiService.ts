
import { GoogleGenAI, Type } from "@google/genai";
import { Repository, RepoAnalysis, MultiRepoContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhanced retry logic specifically tuned for Gemini's rate limits (429).
 * Uses exponential backoff with a higher base delay and jitter.
 */
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
        // Exponential backoff: 5s, 10s, 20s, 40s...
        const jitter = Math.random() * 1000;
        const waitTime = (baseDelay * Math.pow(2, i)) + jitter;
        console.warn(`[Gemini API] Rate limit hit. Attempt ${i + 1}/${retries}. Retrying in ${Math.round(waitTime)}ms...`);
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
      description: "Daily commit activity for the last 7-10 days",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Short date (e.g. Mon, Tue or MM/DD)" },
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
        estimatedSavings: { type: Type.STRING },
        enterpriseReadiness: { type: Type.NUMBER },
        licensingNote: { type: Type.STRING },
        estimatedOpEx: { type: Type.STRING },
        marketTrajectory: { type: Type.STRING },
        commercialAlternatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Paid products this project competes with" },
        saasMonetizationScore: { type: Type.NUMBER, description: "Potential to be turned into a SaaS (0-100)" },
        securityHeuristic: { type: Type.STRING, description: "High-level security risk evaluation" }
      },
      required: ["maintenanceRisk", "estimatedSavings", "enterpriseReadiness", "licensingNote", "estimatedOpEx", "marketTrajectory", "commercialAlternatives", "saasMonetizationScore", "securityHeuristic"]
    }
  },
  required: ["keyFeatures", "recentActivity", "sentiment", "relatedRepos", "contributionInsights", "businessValue", "dailyMomentum"],
};

export const fetchTrendingRepos = async (topic: string, days: number, sortBy: 'trending' | 'newest' = 'trending'): Promise<Repository[]> => {
  try {
    let prompt = `Analyze GitHub to find top ${sortBy} repositories for topic "${topic}" in the last ${days} days. 
    Provide name, owner, description, url, language, stars, tags, trendingScore, sentimentScore. Return as JSON array.`;

    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    }));

    return JSON.parse(response.text || "[]") as Repository[];
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const generateTrendSummary = async (topic: string, repos: Repository[]): Promise<string> => {
  try {
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
    const prompt = `Deep Strategic Audit for "${repo.name}" by "${repo.owner}". 
    Evaluate: 
    - Key Tech Features
    - Maintenance Risk (Bus factor)
    - ROI (Man-months saved)
    - FinOps (100k user cloud cost)
    - 12-month trajectory prediction
    - Commercial Competitors: List paid SaaS/Software alternatives.
    - SaaS Index: How easy is it to monetize?
    - Security Heuristic: High-level risk check.
    - HIGH GRANULARITY TELEMETRY: Provide daily commit counts for the last 7-10 days based on recent repo activity.
    - Contribution Roadmap.`;
    
    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        responseMimeType: "application/json", 
        responseSchema: analysisSchema 
      },
    }));
    return JSON.parse(response.text || "{}") as RepoAnalysis;
  } catch (error) {
    console.error("Deep audit error:", error);
    // Return a structured error fallback to prevent UI crash
    return {
      keyFeatures: ["Information Unavailable"],
      recentActivity: ["Metadata Fetch Failed"],
      sentiment: "Neutral",
      contributionInsights: [],
      relatedRepos: [],
      dailyMomentum: [],
      businessValue: {
        maintenanceRisk: "High",
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
  let instruction = `Generate ${type} content for repository "${repo.name}" by ${repo.owner}. Description: ${repo.description}. Focus on business value and unique market position.`;
  
  if (type === 'blog_post') {
    instruction = `Generate a high-quality, professional TECHNICAL BLOG POST about the repository "${repo.name}".
    Include:
    1. A compelling title.
    2. Introduction: What problem does this solve?
    3. Technical Deep Dive: Key features and architectural advantages.
    4. Business Impact: ROI, efficiency gains, and market relevance.
    5. Conclusion: Future outlook.
    Maintain a sophisticated yet accessible tone for a CTO/Senior Engineer audience. Use Markdown for formatting.`;
  } else if (type === 'pitch') {
    instruction = `Generate a persuasive Executive ROI Pitch for "${repo.name}". Focus on man-months saved, OpEx reduction, and competitive edge.`;
  }

  const response = await runWithRetry(() => ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: instruction 
  }));
  return response.text || "Failed to generate marketing assets.";
};

export const generateMultiRepoContent = async (repos: Repository[], type: MultiRepoContentType): Promise<string> => {
  const repoDetails = repos.map(r => `- ${r.name}: ${r.description}`).join('\n');
  let prompt = `Strategic Portfolio Synthesis of:\n${repoDetails}\n\n`;

  switch (type) {
    case 'merger_acquisition_audit':
      prompt += "Act as a Corporate Strategy Director. Analyze these as an M&A Strategic fit. Evaluate the 'Build vs Buy' calculus for a tech giant. Focus on integration hurdles and IP value.";
      break;
    case 'talent_acquisition_roadmap':
      prompt += "Act as a Technical Recruiting Lead. Map the specialized talent cluster here. What are the key hiring sources and what is the 'market scarcity' of this specific skillset?";
      break;
    case 'venture_opportunity':
      prompt += `ACT AS A TOP-TIER VENTURE CAPITALIST (VC). 
      Design a comprehensive 'VENTURE OPPORTUNITY ANALYSIS' for this technical stack. 
      Your output MUST include:
      1. THE MARKET GAP: What urgent enterprise problem is currently unsolved by these repos alone?
      2. THE MONETIZATION BLUEPRINT: Detailed SaaS tiers (Free, Pro, Enterprise) with hypothetical pricing.
      3. REVENUE PROJECTIONS: Estimated Year-1 and Year-3 ARR (Annual Recurring Revenue).
      4. THE TECHNICAL MOAT: Why is this hard to replicate?
      5. EXIT STRATEGY: List 3 likely acquirers (e.g., Microsoft, Salesforce, Datadog) and WHY they would buy.
      6. RISK ASSESSMENT: Regulatory, technical, or market risks.
      
      BE BOLD, QUANTITATIVE, AND STRATEGIC.`;
      break;
    case 'stakeholder_pitch':
      prompt += "Act as a Chief Innovation Officer. Generate an Executive ROI Pitch for a Board of Directors. Focus on digital transformation, OpEx reduction, and competitive acceleration.";
      break;
    default:
      prompt += `Generate a high-level ${type} for these repositories.`;
  }

  const response = await runWithRetry(() => ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class Venture Capitalist, M&A Advisor, and Technical Architect. Your analysis is sharp, business-oriented, and identifies massive value where others see code.",
    }
  }));

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
    await new Promise(resolve => setTimeout(resolve, 10000));
    if (options.signal.aborted) throw new Error('Aborted');
    operation = await currentAiInstance.operations.getVideosOperation({ operation: operation });
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};
