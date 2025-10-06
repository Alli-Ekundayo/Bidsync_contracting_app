
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { OpportunityData } from '@/types/opportunity';

export interface UserOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  opportunity_data: OpportunityData | string;
  ai_analysis: any;
  relevance_score?: number;
  is_saved?: boolean;
  is_applied?: boolean;
  source_platform: string;
  created_at: string;
}

export const useUserOpportunities = () => {
  const [opportunities, setOpportunities] = useState<UserOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOpportunities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch opportunities',
          variant: 'destructive',
        });
        return;
      }

      setOpportunities(data || []);
    } catch (error) {
      console.error('Error in fetchOpportunities:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch opportunities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return { opportunities, loading, refetch: fetchOpportunities };
};
