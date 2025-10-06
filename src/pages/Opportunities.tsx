
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, DollarSign, Building, Star, Eye, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useUserOpportunities } from "@/hooks/useUserOpportunities";
import { sendToCreateProposalWebhook } from "@/utils/webhooks";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import OpportunityDetailsModal from "@/components/OpportunityDetailsModal";
import { OpportunityData, UserOpportunity } from "@/types/opportunity";

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [creatingProposal, setCreatingProposal] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<UserOpportunity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { opportunities, loading } = useUserOpportunities();
  const { toast } = useToast();

  const handleStartProposal = async (opportunityId: string) => {
    try {
      setCreatingProposal(opportunityId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to create a proposal",
          variant: "destructive",
        });
        return;
      }

      await sendToCreateProposalWebhook(user.id, opportunityId);
      
      toast({
        title: "Proposal Creation Started",
        description: "Your proposal is being generated. You'll be notified when it's ready.",
      });
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to start proposal creation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingProposal(null);
    }
  };

  const handleViewDetails = (opportunity: UserOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailsModalOpen(true);
  };

const formatCurrency = (value: string) => {
  const number = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const parseOpportunityData = (data: OpportunityData | string, opportunityId?: string): OpportunityData => {
  // If it's already an object, validate and transform it
  if (typeof data === 'object' && data !== null) {
    console.log('Data is already an object:', data);
    return data as OpportunityData;
  }

  if (typeof data === 'string') {
    try {
      // Log the entire data for inspection
      console.log('Raw opportunity data:', {
        id: opportunityId,
        data: data
      });

      // Try to detect if the data is already stringified
      let jsonData = data;
      try {
        // Sometimes the data might be double-encoded
        const parsed = JSON.parse(data);
        if (typeof parsed === 'string') {
          jsonData = parsed;
        }
      } catch {
        // If parsing fails, use the original string
      }
      
      // Log the problematic area around position 248
      const start = Math.max(0, 248 - 50);
      const end = Math.min(data.length, 248 + 50);
      console.log('Context around position 248:', {
        before: data.substring(start, 248),
        problematicChar: data.charAt(248),
        after: data.substring(249, end)
      });

      // Try to clean the string first (operate on jsonData which may have been unwrapped)
      const cleanedData = jsonData
        .replace(/[\u0000-\u0019]+/g, '') // Remove control characters
        .replace(/,\s*}/g, '}')           // Remove trailing commas
        .replace(/,\s*]/g, ']')           // Remove trailing commas in arrays
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Ensure property names are quoted
        .replace(/:\s*'([^']*?)'\s*(,|})/g, ':"$1"$2'); // Convert single quotes to double quotes

      console.log('Cleaned data:', cleanedData);
      
      // First try parsing the (possibly unwrapped) jsonData. If that fails, try parsing the cleanedData.
      let parsed: any;
      try {
        parsed = JSON.parse(jsonData);
      } catch (e) {
        parsed = JSON.parse(cleanedData);
      }
      
      // Validate the parsed data has required fields
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Parsed data is not an object');
      }

      return {
        type: parsed.type || 'unknown',
        source: parsed.source || 'unknown',
        title: parsed.title || 'Error Loading Opportunity',
        description: parsed.description || 'N/A',
        agency: parsed.agency || 'N/A',
        subAgency: parsed.subAgency || 'N/A',
        postedDate: parsed.postedDate || '',
        responseDeadline: parsed.responseDeadline || '',
        lastModified: parsed.lastModified || '',
        naicsCode: parsed.naicsCode || 'N/A',
        naicsDescription: parsed.naicsDescription || 'N/A',
        location: parsed.location || 'N/A',
        status: parsed.status || 'unknown',
        link: parsed.link || '',
        estimatedValue: parsed.estimatedValue || '0',
        formattedValue: parsed.formattedValue || '$0',
        rawData: {
          source: parsed.rawData?.source || 'unknown',
          originalId: parsed.rawData?.originalId || '',
          lastProcessed: parsed.rawData?.lastProcessed || new Date().toISOString()
        },
        _metadata: {
          processedAt: parsed._metadata?.processedAt || new Date().toISOString(),
          workflowId: parsed._metadata?.workflowId || '',
          executionId: parsed._metadata?.executionId || ''
        }
      };
    } catch (error) {
      console.error('Error parsing opportunity data:', error);
      if (error instanceof Error) {
        console.debug('Problematic JSON string (truncated):', String(data).substring(0, 1000) + '...');
      }

      // Try tolerant extraction of a few common fields from malformed JSON-like strings
      const fallback = {
        type: 'unknown',
        source: 'unknown',
        title: 'Error Loading Opportunity',
        description: 'N/A',
        agency: 'N/A',
        subAgency: 'N/A',
        postedDate: '',
        responseDeadline: '',
        lastModified: '',
        naicsCode: 'N/A',
        naicsDescription: 'N/A',
        location: 'N/A',
        status: 'unknown',
        link: '',
        estimatedValue: '0',
        formattedValue: '$0',
        rawData: {
          source: 'unknown',
          originalId: '',
          lastProcessed: new Date().toISOString()
        },
        _metadata: {
          processedAt: new Date().toISOString(),
          workflowId: '',
          executionId: ''
        }
      } as OpportunityData;

      if (typeof data === 'string') {
        try {
          const s = data;

          const matchString = (keys: string[]) => {
            for (const key of keys) {
              // try patterns like "key": "value"
              const rx1 = new RegExp('"' + key + '"\\s*:\\s*"([^"]+)"');
              const rx2 = new RegExp(key + '\\s*:\\s*' + "'([^']+)'");
              const rx3 = new RegExp(key + '\\s*:\\s*([^,}\\n]+)');
              const a = s.match(rx1) || s.match(rx2) || s.match(rx3);
              if (a && a[1]) return a[1].trim();
            }
            return null;
          };

          const title = matchString(['title', 'opportunity_title', 'name']);
          const agency = matchString(['agency', 'department', 'organization']);
          const description = matchString(['description', 'summary', 'overview', 'details']);
          const estimated = matchString(['estimatedValue', 'estimated_value', 'value', 'contract_value']);
          const deadline = matchString(['responseDeadline', 'deadline', 'due_date', 'response_deadline']);
          const location = matchString(['location', 'place_of_performance']);

          if (title) fallback.title = title;
          if (agency) fallback.agency = agency;
          if (description) fallback.description = description;
          if (estimated) {
            // strip non-numeric except dot and comma
            const numeric = String(estimated).replace(/[^0-9\.\,]/g, '');
            fallback.estimatedValue = numeric || '0';
            try {
              const num = parseFloat(numeric.replace(/,/g, '')) || 0;
              fallback.formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
            } catch { /* ignore */ }
          }
          if (deadline) fallback.responseDeadline = deadline;
          if (location) fallback.location = location;

        } catch (e2) {
          console.debug('Fallback extraction failed:', e2);
        }
      }

      return fallback;
    }
  }
  return data;
};

const getOpportunityDescription = (oppData: OpportunityData | string) => {
  const parsedData = parseOpportunityData(oppData);
  return parsedData.description !== 'N/A' ? parsedData.description : 'No description available';
};

  const filters = [
    { id: "all", label: "All Opportunities", count: opportunities.length },
    { id: "high-match", label: "High Match (80%+)", count: opportunities.filter(o => (o.relevance_score || 0) >= 80).length },
    { id: "saved", label: "Saved", count: opportunities.filter(o => o.is_saved).length },
    { id: "applied", label: "Applied", count: opportunities.filter(o => o.is_applied).length }
  ];

    // Log all opportunities data first
  console.log('All opportunities:', opportunities.map(opp => ({
    id: opp.id,
    dataType: typeof opp.opportunity_data,
    hasData: Boolean(opp.opportunity_data)
  })));

  const filteredOpportunities = opportunities.filter(opp => {
    // Skip invalid opportunities
    if (!opp || !opp.opportunity_data) {
      console.warn('Skipping invalid opportunity:', { 
        id: opp?.id,
        opportunity: opp 
      });
      return false;
    }

    let oppData: OpportunityData;
    try {
      // Log the raw data before parsing
      console.log('Processing opportunity:', {
        id: opp.id,
        rawData: opp.opportunity_data
      });
      
      oppData = parseOpportunityData(opp.opportunity_data, opp.id);
      if (!oppData || typeof oppData !== 'object') {
        return false;
      }
    } catch (error) {
      console.error('Error filtering opportunity:', {
        id: opp.id,
        error,
        rawData: typeof opp.opportunity_data === 'string' ? opp.opportunity_data.substring(0, 100) + '...' : JSON.stringify(opp.opportunity_data).substring(0, 100) + '...'
      });
      return false;
    }

    const matchesSearch = (oppData.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (oppData.agency || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case "high-match":
        return matchesSearch && (opp.relevance_score || 0) >= 80;
      case "saved":
        return matchesSearch && opp.is_saved;
      case "applied":
        return matchesSearch && opp.is_applied;
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading opportunities...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600">Discover government contracting opportunities matched to your profile</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2 text-accent" />
            Advanced Filters
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className={selectedFilter === filter.id ? "bg-accent text-accent-foreground" : ""}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.map((opportunity) => {
            // Add validation check for opportunity_data
            if (!opportunity || !opportunity.opportunity_data) {
              console.error('Invalid opportunity in render:', {
                id: opportunity?.id,
                hasData: Boolean(opportunity?.opportunity_data)
              });
              return null;
            }
            
            let oppData: OpportunityData;
            try {
              oppData = parseOpportunityData(opportunity.opportunity_data, opportunity.id);
              // Validate required fields
              if (!oppData || typeof oppData !== 'object') {
                throw new Error('Invalid opportunity data structure');
              }
            } catch (error) {
              console.error('Failed to parse opportunity:', {
                id: opportunity.id,
                error,
                rawData: opportunity.opportunity_data
              });
              // Return a card with error state instead of failing the whole render
              // Log the error details
              console.error('Opportunity parsing error:', {
                id: opportunity.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                dataType: typeof opportunity.opportunity_data,
                dataPreview: typeof opportunity.opportunity_data === 'string' 
                  ? opportunity.opportunity_data.substring(0, 100) 
                  : JSON.stringify(opportunity.opportunity_data).substring(0, 100)
              });

              return (
                <Card key={opportunity.id} className="hover:shadow-md transition-shadow border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-red-600">
                          Error Loading Opportunity (ID: {opportunity.id})
                        </CardTitle>
                        <CardDescription className="text-sm text-red-500">
                          {error instanceof Error ? `Error: ${error.message}` : 'Unknown error occurred'}
                        </CardDescription>
                        <div className="mt-2 text-xs text-gray-500">
                          Data type: {typeof opportunity.opportunity_data}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            }
            
            return (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {oppData.title !== 'N/A' ? oppData.title : 'Untitled Opportunity'}
                        </CardTitle>
                        {opportunity.relevance_score && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {opportunity.relevance_score}% Match
                          </Badge>
                        )}
                        {opportunity.is_saved && (
                          <Star className="h-4 w-4 fill-accent text-accent" />
                        )}
                        {opportunity.is_applied && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Applied
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                        <span>{oppData.agency}</span>
                        {oppData.subAgency && oppData.subAgency !== oppData.agency && (
                          <span>• {oppData.subAgency}</span>
                        )}
                      </CardDescription>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {getOpportunityDescription(oppData)}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {oppData.estimatedValue && oppData.estimatedValue !== '0' && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-medium text-green-600">
                              {oppData.formattedValue || formatCurrency(oppData.estimatedValue)}
                            </span>
                          </div>
                        )}
                        {oppData.responseDeadline && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {formatDate(oppData.responseDeadline)}
                          </div>
                        )}
                        {oppData.location && oppData.location !== 'N/A' && (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {oppData.location}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {oppData.naicsCode && oppData.naicsCode !== 'N/A' && (
                          <Badge variant="outline" className="text-xs">
                            NAICS: {oppData.naicsCode}
                            {oppData.naicsDescription !== 'N/A' && (
                              <span className="ml-1 text-gray-500">({oppData.naicsDescription})</span>
                            )}
                          </Badge>
                        )}
                        <Badge variant="outline" className={
                          oppData.status === 'active' ? 'bg-green-50 text-green-700' :
                          oppData.status === 'inactive' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-700'
                        }>
                          {oppData.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{oppData.source}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Added: {new Date(opportunity.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleViewDetails({
                                        ...opportunity,
                                        opportunity_data: parseOpportunityData(opportunity.opportunity_data, opportunity.id),
                                        ai_analysis: opportunity.ai_analysis || {}
                                      })}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleStartProposal(opportunity.opportunity_id)}
                        disabled={creatingProposal === opportunity.opportunity_id}
                        className="button-primary"
                      >
                        {creatingProposal === opportunity.opportunity_id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Start Proposal'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No opportunities found matching your criteria.</p>
          </div>
        )}
      </div>

      <OpportunityDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        opportunity={selectedOpportunity ? {
          id: selectedOpportunity.id,
          opportunity_data: selectedOpportunity.opportunity_data,
          ai_analysis: selectedOpportunity.ai_analysis || {},
          relevance_score: selectedOpportunity.relevance_score || 0,
          source_platform: selectedOpportunity.source_platform,
          is_saved: selectedOpportunity.is_saved || false,
          is_applied: selectedOpportunity.is_applied || false
        } : null}
      />
    </DashboardLayout>
  );
};

export default Opportunities;
