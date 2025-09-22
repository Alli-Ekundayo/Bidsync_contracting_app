import { useState, useEffect } from 'react';
import { useUserOpportunities } from './useUserOpportunities';
import { useProposals } from './useProposals';

export interface CorrelatedData {
  opportunities: any[];
  proposals: any[];
  opportunityProposalMap: Map<string, any[]>;
  proposalOpportunityMap: Map<string, any>;
}

export const useOpportunityProposalCorrelation = () => {
  const { opportunities, loading: oppLoading } = useUserOpportunities();
  const { proposals, loading: propLoading } = useProposals();
  const [correlatedData, setCorrelatedData] = useState<CorrelatedData>({
    opportunities: [],
    proposals: [],
    opportunityProposalMap: new Map(),
    proposalOpportunityMap: new Map(),
  });

  useEffect(() => {
    if (!oppLoading && !propLoading) {
      const opportunityProposalMap = new Map<string, any[]>();
      const proposalOpportunityMap = new Map<string, any>();

      // Map proposals to opportunities
      proposals.forEach(proposal => {
        const matchingOpportunity = opportunities.find(opp => 
          opp.opportunity_id.toString() === proposal.opportunity_id.toString()
        );
        
        if (matchingOpportunity) {
          proposalOpportunityMap.set(proposal.id, matchingOpportunity);
          
          const existingProposals = opportunityProposalMap.get(matchingOpportunity.opportunity_id) || [];
          opportunityProposalMap.set(matchingOpportunity.opportunity_id, [...existingProposals, proposal]);
        }
      });

      setCorrelatedData({
        opportunities,
        proposals,
        opportunityProposalMap,
        proposalOpportunityMap,
      });
    }
  }, [opportunities, proposals, oppLoading, propLoading]);

  const getProposalsForOpportunity = (opportunityId: string) => {
    return correlatedData.opportunityProposalMap.get(opportunityId) || [];
  };

  const getOpportunityForProposal = (proposalId: string) => {
    return correlatedData.proposalOpportunityMap.get(proposalId);
  };

  return {
    ...correlatedData,
    loading: oppLoading || propLoading,
    getProposalsForOpportunity,
    getOpportunityForProposal,
  };
};