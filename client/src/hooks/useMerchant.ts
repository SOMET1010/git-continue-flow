import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface Merchant {
  id: number;
  user_id: number;
  merchant_number: string | null;
  business_name: string | null;
  activity_type: string | null;
  market_id: number | null;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  suta_score: number;
  cnps_number: string | null;
  cnps_expiry: string | null;
  cmu_number: string | null;
  cmu_expiry: string | null;
  rsti_number: string | null;
  rsti_expiry: string | null;
  created_at: string;
  updated_at: string;
}

export function useMerchant() {
  const { user } = useSupabaseAuth();

  return useQuery({
    queryKey: ['merchant', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data as Merchant | null;
    },
    enabled: !!user,
  });
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Merchant> & { id: number }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from('merchants')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
    },
  });
}
