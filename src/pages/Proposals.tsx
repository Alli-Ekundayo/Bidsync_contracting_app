import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Calendar, DollarSign, Edit, Trash2, Download, Plus, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendToCreateProposalWebhook } from "@/utils/webhooks";
import ProposalDetailsModal from "@/components/ProposalDetailsModal";
import { useOpportunityProposalCorrelation } from "@/hooks/useOpportunityProposalCorrelation";
import { safeParseJson } from '@/lib/utils';

const Proposals = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { proposals, loading, getOpportunityForProposal } = useOpportunityProposalCorrelation();
  const { toast } = useToast();

  const handleCreateProposal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to create a proposal",
          variant: "destructive",
        });
        return;
      }

      // For demo purposes, using a placeholder opportunity_id
      const opportunityId = "sample-opportunity-id";
      
      // Send to webhook
      await sendToCreateProposalWebhook(user.id, opportunityId);
      
      toast({
        title: "Proposal Creation Started",
        description: "Your proposal is being created. Please check back shortly.",
      });
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProposal = (proposal: any) => {
    setSelectedProposal(proposal);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete proposal",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Proposal deleted successfully",
      });

      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to delete proposal",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: "all", label: "All Proposals", count: proposals.length },
    { id: "draft", label: "Drafts", count: proposals.filter(p => p.status === 'draft' || p.status === 'In Progress').length },
    { id: "submitted", label: "Submitted", count: proposals.filter(p => p.status === 'submitted' || p.status === 'In Review').length },
    { id: "won", label: "Won", count: proposals.filter(p => p.status === 'won').length },
    { id: "lost", label: "Lost", count: proposals.filter(p => p.status === 'lost').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in review":
        return "bg-purple-100 text-purple-800";
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    switch (activeTab) {
      case "draft":
        return proposal.status === "draft" || proposal.status === "In Progress";
      case "submitted":
        return proposal.status === "submitted" || proposal.status === "In Review";
      case "won":
        return proposal.status === "won";
      case "lost":
        return proposal.status === "lost";
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading proposals...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-600">Manage your proposal pipeline and track progress</p>
          </div>
          <Button onClick={handleCreateProposal} className="button-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "bg-accent text-accent-foreground" : ""}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const linkedOpportunity = getOpportunityForProposal(proposal.id);
            const isOrphaned = !linkedOpportunity;
            
            return (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {(() => {
                            // First try to get title from proposal content
                              if (proposal.content) {
                                  try {
                                    const parsed = safeParseJson(proposal.content);
                                    const proposalData = parsed?.proposal || parsed;
                                    if (proposalData?.opportunity_title) {
                                      return proposalData.opportunity_title;
                                    }
                                  } catch (e) {
                                    // If JSON parsing fails, just use the proposal title
                                    return proposal.title;
                                  }
                              }
                            
                            // Fallback to linked opportunity title
                              if (linkedOpportunity) {
                                const lo = safeParseJson(linkedOpportunity.opportunity_data);
                                return lo?.title || proposal.title;
                              }
                            
                            return proposal.title;
                          })()}
                        </CardTitle>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                        {isOrphaned && (
                          <Badge variant="destructive" className="bg-accent/10 text-accent">
                            <AlertTriangle className="h-3 w-3 mr-1 text-accent" />
                            No Linked Opportunity
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {proposal.deadline && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(proposal.deadline).toLocaleDateString()}
                          </div>
                        )}
                        {proposal.submission_date && (
                          <div className="text-sm text-gray-500">
                            Submitted: {new Date(proposal.submission_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(proposal.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {proposal.status === "draft" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditProposal(proposal)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProposal(proposal)}
                          >
                            View
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteProposal(proposal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No proposals found in this category.</p>
            <Button onClick={handleCreateProposal} className="button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Proposal
            </Button>
          </div>
        )}
      </div>

      <ProposalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        proposal={selectedProposal}
      />
    </DashboardLayout>
  );
};

export default Proposals;
