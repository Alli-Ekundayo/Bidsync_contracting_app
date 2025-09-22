
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

const Opportunities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [creatingProposal, setCreatingProposal] = useState<string | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
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

  const handleViewDetails = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsDetailsModalOpen(true);
  };

  const getOpportunityDescription = (oppData: any) => {
    // Parse the data if it's a JSON string
    let parsedData = oppData;
    if (typeof oppData === 'string') {
      try {
        parsedData = JSON.parse(oppData);
      } catch (error) {
        parsedData = oppData;
      }
    }
    
    // Try multiple possible fields for description
    return parsedData.description || 
           parsedData.summary || 
           parsedData.overview || 
           parsedData.details || 
           parsedData.solicitation_description ||
           parsedData.brief_description ||
           'No description available';
  };

  const filters = [
    { id: "all", label: "All Opportunities", count: opportunities.length },
    { id: "high-match", label: "High Match (80%+)", count: opportunities.filter(o => (o.relevance_score || 0) >= 80).length },
    { id: "saved", label: "Saved", count: opportunities.filter(o => o.is_saved).length },
    { id: "applied", label: "Applied", count: opportunities.filter(o => o.is_applied).length }
  ];

  const filteredOpportunities = opportunities.filter(opp => {
    const oppData = opp.opportunity_data || {};
    // Parse the data if it's a JSON string
    let parsedData = oppData;
    if (typeof oppData === 'string') {
      try {
        parsedData = JSON.parse(oppData);
      } catch (error) {
        parsedData = oppData;
      }
    }
    
    const matchesSearch = (parsedData.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (parsedData.agency || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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
            const oppData = opportunity.opportunity_data || {};
            // Parse the data if it's a JSON string
            let parsedData = oppData;
            if (typeof oppData === 'string') {
              try {
                parsedData = JSON.parse(oppData);
              } catch (error) {
                parsedData = oppData;
              }
            }
            
            return (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{parsedData.title || 'Untitled Opportunity'}</CardTitle>
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
                      <CardDescription className="text-sm text-gray-600 mb-2">
                        {parsedData.agency || 'Government Agency'}
                      </CardDescription>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {getOpportunityDescription(parsedData)}
                      </p>
                      
                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                         {parsedData.value && (
                           <div className="flex items-center">
                             <DollarSign className="h-4 w-4 mr-1" />
                             <span className="font-medium text-green-600">{parsedData.value}</span>
                           </div>
                         )}
                         {parsedData.deadline && (
                           <div className="flex items-center">
                             <Calendar className="h-4 w-4 mr-1" />
                             Due: {new Date(parsedData.deadline).toLocaleDateString()}
                           </div>
                         )}
                         {parsedData.location && (
                           <div className="flex items-center">
                             <Building className="h-4 w-4 mr-1" />
                             {parsedData.location}
                           </div>
                         )}
                       </div>

                       <div className="flex flex-wrap gap-2 mt-3">
                         {parsedData.naics && (
                           <Badge variant="outline">NAICS: {parsedData.naics}</Badge>
                         )}
                         {parsedData.setAside && parsedData.setAside !== "None" && (
                           <Badge variant="outline">{parsedData.setAside}</Badge>
                         )}
                         <Badge variant="outline">{opportunity.source_platform}</Badge>
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
                        onClick={() => handleViewDetails(opportunity)}
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
        opportunity={selectedOpportunity}
      />
    </DashboardLayout>
  );
};

export default Opportunities;
