import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Repository, RepoAnalysis } from "../types";

// Initialize the Gemini client
// API key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Retry helper for exponential backoff
const runWithRetry = async (fn: () => Promise<any>, retries = 4, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error.status === 429 || 
                           error.code === 429 || 
                           error.message?.includes('429') || 
                           error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && i < retries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.warn(`Quota limit hit. Retrying in ${waitTime}ms (attempt ${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      console.error("All retries failed or non-quota error occurred:", error);
      throw error;
    }
  }
};

const repoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "The name of the repository.",
    },
    owner: {
      type: Type.STRING,
      description: "The owner or organization of the repository.",
    },
    description: {
      type: Type.STRING,
      description: "A concise summary of what the repository does.",
    },
    url: {
      type: Type.STRING,
      description: "The full URL to the GitHub repository.",
    },
    language: {
      type: Type.STRING,
      description: "The primary programming language used.",
    },
    stars: {
      type: Type.STRING,
      description: "Approximate number of stars (e.g., '1.2k', '500').",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-4 relevant tags for the repository (e.g., 'Machine Learning', 'Web Framework').",
    },
    trendingScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the repository's current trending intensity or viral status based on recent star velocity and activity.",
    },
    sentimentScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing general community sentiment (0=Negative, 50=Neutral, 100=Positive).",
    },
  },
  required: ["name", "description", "url", "language", "stars", "trendingScore", "sentimentScore"],
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: repoSchema,
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    keyFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-4 key technical features.",
    },
    recentActivity: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 recent significant updates, commits, or news items found via search.",
    },
    sentiment: {
      type: Type.STRING,
      description: "A short paragraph summarizing community reception and potential use cases.",
    },
    commitHistory: {
      type: Type.ARRAY,
      description: "Estimated number of commits per week for the past 4 weeks (last 30 days).",
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.STRING, description: "Label (e.g. 'Week 1', 'Week 2')" },
          commits: { type: Type.INTEGER, description: "Estimated number of commits" }
        }
      }
    },
    relatedRepos: {
      type: Type.ARRAY,
      description: "List of 3 similar or alternative repositories found via search.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the repo" },
          url: { type: Type.STRING, description: "URL of the repo" },
          description: { type: Type.STRING, description: "Short description" },
          stars: { type: Type.STRING, description: "Approx stars" }
        }
      }
    }
  },
  required: ["keyFeatures", "recentActivity", "sentiment", "relatedRepos"],
};

export const fetchTrendingRepos = async (topic: string, days: number, sortBy: 'trending' | 'newest' = 'trending'): Promise<Repository[]> => {
  try {
    let prompt = "";
    const basePrompt = `
      Use Google Search to ensure the data is current and accurate.
      Return ONLY a raw JSON array (no markdown, no commentary) of at least 6 repositories.
      For each repository, provide:
      - name, owner, description (ensure quotes are escaped), direct GitHub URL
      - primary language
      - approximate star count
      - a few tags
      - a 'trendingScore' (0-100).
      - a 'sentimentScore' (0-100) based on community feedback (discussions, issues, twitter, reddit).
    `;

    if (sortBy === 'trending') {
      prompt = `
        Find top trending GitHub repositories related to "${topic}" that have been popular, created, or significantly updated in the last ${days} days.
        ${basePrompt}
        The 'trendingScore' should be based on viral status.
      `;
    } else { // sortBy === 'newest'
      prompt = `
        Find newly created or most recently updated GitHub repositories related to "${topic}" that have gained attention in the last ${days} days. Prioritize projects with recent activity or high initial velocity.
        Look for "new GitHub projects ${topic}", "recently created GitHub repos ${topic}", or "top new ${topic} open source projects".
        ${basePrompt}
        The 'trendingScore' should be based on recent activity/initial popularity.
      `;
    }


    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    }));

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from Gemini.");
    }

    // Clean potential markdown fences and trim whitespace.
    let cleanedJsonText = jsonText.trim();
    if (cleanedJsonText.startsWith('```json')) {
      cleanedJsonText = cleanedJsonText.substring(7);
      if (cleanedJsonText.endsWith('```')) {
        cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
      }
    }
    cleanedJsonText = cleanedJsonText.trim();

    const repos = JSON.parse(cleanedJsonText) as Repository[];
    
    // Fallback normalization just in case
    return repos.map(repo => ({
      ...repo,
      language: repo.language || 'Unknown',
      stars: repo.stars || 'N/A',
      tags: repo.tags || [],
      trendingScore: typeof repo.trendingScore === 'number' ? repo.trendingScore : 50,
      sentimentScore: typeof repo.sentimentScore === 'number' ? repo.sentimentScore : 50
    }));

  } catch (error) {
    console.error("Error fetching trending repos:", error);
    throw error;
  }
};

export const generateTrendSummary = async (topic: string, repos: Repository[]): Promise<string> => {
  try {
    const repoNames = repos.map(r => r.name).join(", ");
    const prompt = `
      Based on this list of trending GitHub repositories in "${topic}": ${repoNames}.
      Write a short, engaging 2-sentence summary of the current state of this tech trend.
      Make it sound professional yet exciting for a developer portfolio.
    `;

    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    }));

    return response.text || `Exploring the latest innovations in ${topic}.`;
  } catch (e) {
    return `Latest trending projects in ${topic}.`;
  }
};

export const analyzeRepository = async (repo: Repository): Promise<RepoAnalysis> => {
  try {
    const prompt = `
      Perform a deep dive analysis of the GitHub repository "${repo.name}" by "${repo.owner}".
      Use Google Search to find:
      1. Key technical features.
      2. Recent activity (commits, releases) in the last 30 days.
      3. Community sentiment.
      4. Estimated commit frequency (count per week for the last 4 weeks.
      5. Identify 3 related or alternative repositories that developers might also be interested in.
      
      Return ONLY a raw JSON object (no markdown, no commentary) with:
      - keyFeatures: 3-4 distinct technical features.
      - recentActivity: 3 specific recent updates.
      - sentiment: Brief summary. Ensure any quotes are properly escaped.
      - commitHistory: Array of 4 objects representing the last 4 weeks.
      - relatedRepos: Array of 3 objects with name, url, description, stars. Ensure any quotes in description are properly escaped.
    `;

    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    }));

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis returned");
    
    // Clean potential markdown fences and trim whitespace.
    let cleanedJsonText = jsonText.trim();
    if (cleanedJsonText.startsWith('```json')) {
      cleanedJsonText = cleanedJsonText.substring(7);
      if (cleanedJsonText.endsWith('```')) {
        cleanedJsonText = cleanedJsonText.substring(0, cleanedJsonText.length - 3);
      }
    }
    cleanedJsonText = cleanedJsonText.trim();

    return JSON.parse(cleanedJsonText) as RepoAnalysis;
  } catch (error) {
    console.error("Error analyzing repo:", error);
    // Return mock fallback if analysis fails to avoid breaking UI
    return {
      keyFeatures: ["Innovative Architecture", "High Performance", "Active Community"],
      recentActivity: ["Recent version update", "Bug fixes and stability improvements", "Growing star count"],
      sentiment: "This repository is gaining traction due to its unique approach to solving complex problems in its domain.",
      commitHistory: [
        { week: 'Week 1', commits: 12 },
        { week: 'Week 2', commits: 8 },
        { week: 'Week 3', commits: 15 },
        { week: 'Week 4', commits: 22 }
      ],
      relatedRepos: [
        { name: "SimilarRepo1", url: "#", description: "A similar tool in the same space.", stars: "5.2k" },
        { name: "AlternativeLib", url: "#", description: "A popular alternative with different features.", stars: "3.1k" },
        { name: "RelatedFramework", url: "#", description: "Often used together with this repo.", stars: "12k" }
      ]
    };
  }
};

export const generateCreativeContent = async (repo: Repository, type: 'twitter' | 'linkedin' | 'blog' | 'video_script'): Promise<string> => {
  try {
    let prompt = "";
    const baseInfo = `Repository: "${repo.name}" by ${repo.owner}. Description: ${repo.description}. Language: ${repo.language}. Tags: ${repo.tags.join(', ')}.`;

    switch (type) {
      case 'twitter':
        prompt = `
          ${baseInfo}
          Write a viral, engaging Twitter thread (or single long tweet) about this repository. 
          Focus on the problem it solves and why developers should care. 
          Include 3 relevant hashtags and emojis. Keep the tone exciting and "tech-savvy".
          Do not include "Tweet 1/X" prefixes, just the content.
        `;
        break;
      case 'linkedin':
        prompt = `
          ${baseInfo}
          Write a professional LinkedIn post about this repository.
          Structure:
          1. Hook: A strong opening question or statement about the industry problem.
          2. Solution: Introduce ${repo.name} as the solution.
          3. Key Benefits: Bullet points of why it's valuable.
          4. Call to Action: Encourage connection or checking out the code.
          Tone: Professional, insightful, thought leadership.
        `;
        break;
      case 'blog':
        prompt = `
          ${baseInfo}
          Write a short technical blog post (Markdown format) introducing this tool.
          Structure:
          - Catchy Title
          - Introduction (The "Why")
          - What is ${repo.name}?
          - Key Features
          - Use Cases
          - Conclusion
          Keep it concise (approx 300 words) but informative for a developer audience.
        `;
        break;
      case 'video_script':
        prompt = `
          ${baseInfo}
          Write a script for a viral TikTok or YouTube Short video (vertical format, <60s) about this repository.
          Target Audience: Developers and Tech Enthusiasts.
          
          Format the output clearly with the following sections:
          **Title/Hook:** [Catchy text on screen]
          **Music Vibe:** [Suggested background music style]
          
          **Script Table (Markdown):**
          | Time   | Visual Scene                                  | Audio/Voiceover                                       |
          |--------|-----------------------------------------------|-------------------------------------------------------|
          | 0-5s   | [Describe a fast-paced, eye-catching visual]  | [Write a strong, punchy opening line or question]     |
          | 5-15s  | [Show the problem the repo solves]            | [Explain the pain point in a relatable way]           |
          | 15-30s | [Rapid cuts of the repo's code/features/UI]   | [Quickly list 2-3 killer features]                    |
          | 30-40s | [Showcase a cool 'wow factor' result]         | ["And the best part is..." or a similar exciting line]|
          | 40-50s | [Show the GitHub page getting a star]         | [Clear Call to Action: "Star the repo on GitHub!"]    |
          
          Make the hook strong and the CTA clear ("Link in bio" / "Star the repo").
          Style: Fast-paced, energetic, creator-style.
        `;
        break;
    }

    const response = await runWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    }));

    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Error generating content:", error);
    return "An error occurred while generating content. Please try again. System may be busy.";
  }
};

interface VideoGenerationOptions {
  signal: AbortSignal;
}

export const generateVideoForRepo = async (repo: Repository, options: VideoGenerationOptions): Promise<string> => {
  if (typeof window === 'undefined' || !window.aistudio) {
    throw new Error("AI Studio environment not detected. Video generation requires a supported environment.");
  }

  try {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      throw new Error("API_KEY_REQUIRED");
    }

    // Generate a detailed video script first to guide Veo
    const videoScript = await generateCreativeContent(repo, 'video_script');
    
    const titleMatch = videoScript.match(/\*\*Title\/Hook:\*\*\s*(.*)/i);
    const scriptTableMatch = videoScript.match(/\|.*\|([\s\S]*)/m);

    let veoPrompt = `Create a short, fast-paced, vertical-format video suitable for TikTok or YouTube Shorts about the GitHub repository "${repo.name}".`;
    if (titleMatch && titleMatch[1]) {
      veoPrompt += ` The video should start with a strong visual hook representing: "${titleMatch[1].trim()}".`;
    }
    
    if (scriptTableMatch && scriptTableMatch[1]) {
      veoPrompt += ` The video should follow these scenes: ${scriptTableMatch[1].trim().replace(/\|/g, ',')}.`;
    }
    
    veoPrompt += ` It must be energetic and include a clear call to action to visit the GitHub page.`;

    const currentAiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await currentAiInstance.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: veoPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16',
      }
    });

    if (options.signal.aborted) {
      throw new DOMException('Generation cancelled by user.', 'AbortError');
    }

    console.log("Video generation operation started. Polling for completion...");

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      if (options.signal.aborted) {
        throw new DOMException('Generation cancelled by user.', 'AbortError');
      }

      operation = await currentAiInstance.operations.getVideosOperation({ operation: operation });
      console.log(`Video generation status: ${operation.done ? 'Done' : 'In Progress'}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Failed to get video download link after generation.");
    }
    
    return `${downloadLink}&key=${process.env.API_KEY}`;

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log("Video generation operation aborted in service.");
    }
    if (error.message === "API_KEY_REQUIRED") {
      throw error;
    }
    if (error.message?.includes("Requested entity was not found.")) {
      console.error("Veo API error: Requested entity was not found. This might indicate an invalid API key or billing issue.");
      throw new Error("API_KEY_INVALID");
    }
    console.error("Error generating video:", error);
    if (error.name !== 'AbortError') {
      throw new Error(`Failed to generate video: ${error.message || "Unknown error"}`);
    }
    throw error;
  }
};