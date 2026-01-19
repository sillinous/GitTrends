
export interface Repository {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: string;
  owner: string;
  tags: string[];
  trendingScore: number;
  sentimentScore?: number;
}

export interface SearchState {
  topic: string;
  days: number;
  sortBy?: 'trending' | 'newest';
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

export interface ContributionInsight {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focusArea: string;
  description: string;
}

export interface BusinessValue {
  maintenanceRisk: 'Low' | 'Medium' | 'High';
  estimatedSavings: string;
  enterpriseReadiness: number;
  licensingNote: string;
  estimatedOpEx: string;
  marketTrajectory: 'Future Standard' | 'Stable Niche' | 'High-Risk Fad' | 'Market Disruption';
  commercialAlternatives?: string[]; // New: Competitive Mapping
  saasMonetizationScore?: number; // New: Revenue Potential
  securityHeuristic?: string; // New: Risk Heuristic
}

export interface RepoAnalysis {
  recentActivity: string[];
  keyFeatures: string[];
  sentiment: string;
  commitHistory?: { week: string; commits: number }[];
  dailyMomentum?: { date: string; commits: number }[]; // New: Granular daily telemetry
  relatedRepos?: RelatedRepo[];
  contributionInsights?: ContributionInsight[];
  businessValue?: BusinessValue;
}

export type MultiRepoContentType = 
  | 'newsletter' 
  | 'comparison' 
  | 'listicle' 
  | 'twitter_thread' 
  | 'architecture_blueprint' 
  | 'venture_opportunity' 
  | 'stakeholder_pitch'
  | 'merger_acquisition_audit'
  | 'talent_acquisition_roadmap';
