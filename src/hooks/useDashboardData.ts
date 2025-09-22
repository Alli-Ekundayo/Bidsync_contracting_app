
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardData {
  totalOpportunities: number;
  savedOpportunities: number;
  appliedOpportunities: number;
  totalProposals: number;
  draftProposals: number;
  submittedProposals: number;
  linkedProposals: number;
  orphanedProposals: number;
  recentOpportunities: any[];
  recentProposals: any[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalOpportunities: 0,
    savedOpportunities: 0,
    appliedOpportunities: 0,
    totalProposals: 0,
    draftProposals: 0,
    submittedProposals: 0,
    linkedProposals: 0,
    orphanedProposals: 0,
    recentOpportunities: [],
    recentProposals: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch opportunities data
      const { data: opportunities, error: oppError } = await supabase
        .from('user_opportunities')
        .select('*')
        .eq('user_id', user.id);

      if (oppError) {
        console.error('Error fetching opportunities:', oppError);
      }

      // Fetch proposals data
      const { data: proposals, error: propError } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id);

      if (propError) {
        console.error('Error fetching proposals:', propError);
      }

      const opportunitiesData = opportunities || [];
      const proposalsData = proposals || [];

      // Calculate linked vs orphaned proposals
      const linkedProposals = proposalsData.filter(proposal => 
        opportunitiesData.some(opp => 
          opp.opportunity_id.toString() === proposal.opportunity_id.toString()
        )
      );
      const orphanedProposals = proposalsData.filter(proposal => 
        !opportunitiesData.some(opp => 
          opp.opportunity_id.toString() === proposal.opportunity_id.toString()
        )
      );

      setDashboardData({
        totalOpportunities: opportunitiesData.length,
        savedOpportunities: opportunitiesData.filter(opp => opp.is_saved).length,
        appliedOpportunities: opportunitiesData.filter(opp => opp.is_applied).length,
        totalProposals: proposalsData.length,
        draftProposals: proposalsData.filter(prop => prop.status === 'draft' || prop.status === 'In Progress').length,
        submittedProposals: proposalsData.filter(prop => prop.status === 'submitted' || prop.status === 'Submitted' || prop.status === 'In Review').length,
        linkedProposals: linkedProposals.length,
        orphanedProposals: orphanedProposals.length,
        recentOpportunities: opportunitiesData.slice(0, 5),
        recentProposals: proposalsData.slice(0, 5),
      });
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { dashboardData, loading, refetch: fetchDashboardData };
};
