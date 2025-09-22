import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Proposal {
  id: string;
  user_id: string;
  opportunity_id: string;
  title: string;
  content: string;
  status: string;
  deadline?: string;
  submission_date?: string;
  compliance_analysis?: any;
  created_at: string;
  updated_at: string;
}

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProposals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch proposals',
          variant: 'destructive',
        });
        return;
      }

      setProposals(data || []);
    } catch (error) {
      console.error('Error in fetchProposals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch proposals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return { proposals, loading, refetch: fetchProposals };
};