export interface OpportunityData {
  type: string;
  source: string;
  title: string;
  description: string;
  agency: string;
  subAgency: string;
  postedDate: string;
  responseDeadline: string;
  lastModified: string;
  naicsCode: string;
  naicsDescription: string;
  location: string;
  status: string;
  link: string;
  estimatedValue: string;
  formattedValue: string;
  rawData: {
    source: string;
    originalId: string;
    lastProcessed: string;
  };
  _metadata: {
    processedAt: string;
    workflowId: string;
    executionId: string;
  };
}

export interface UserOpportunity {
  id: string;
  opportunity_id: string;
  user_id: string;
  opportunity_data: OpportunityData;
  source_platform: string;
  relevance_score?: number;
  is_saved?: boolean;
  is_applied?: boolean;
  created_at: string;
  ai_analysis?: any;
}