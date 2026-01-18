export interface Repository {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: string; // approximate stars as string (e.g. "12k" or "500")
  owner: string;
  tags: string[];
  trendingScore: number; // 0-100 score indicating viral status
  sentimentScore?: number; // 0-100 representing community sentiment
}

export interface SearchState {
  topic: string;
  days: number;
  sortBy?: 'trending' | 'newest'; // Added sortBy option
}

export interface PortfolioItem extends Repository {
  id: string;
  addedAt: number;
}

export interface RelatedRepo {
  name: string;
  url: string;
  description: string;
  stars: string;
}

export interface RepoAnalysis {
  recentActivity: string[];
  keyFeatures: string[];
  sentiment: string;
  commitHistory?: { week: string; commits: number }[];
  relatedRepos?: RelatedRepo[];
}