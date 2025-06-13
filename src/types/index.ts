export interface LoginForm {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface Sentence {
  id: string;
  content: string;
  author: string;
  source: string;
  category: string;
  tags: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SentencesResponse {
  data: Sentence[];  // 改为 data，而不是 sentences
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}


export interface SentenceQueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
  author?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ImportResponse {
  success: number;
  failed: number;
  errors?: string[];
}

export interface SentenceStatistics {
  total: number;
  byCategory: Record<string, {
    name: string;
    count: number;
  }>;
  byAuthor: Record<string, number>;
  recentlyAdded?: Sentence[];
  recentlyUpdated?: Sentence[];
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  redis: string;
  version: string;
  uptime: number;
}

export interface ImageStatistics {
  date: string;
  hourly: Record<string, {
    total: string;
    [key: string]: string; // 动态的endpoint和category统计
  }>;
  total: {
    requests: number;
    byEndpoint: {
      random: number;
      categories: number;
      [key: string]: number;
    };
    byCategory: {
      [category: string]: number;
    };
  };
}