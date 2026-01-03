import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMerchant } from './useMerchant';

export interface SavingsGoal {
  id: number;
  merchant_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  name: string;
  target_amount: number;
  deadline?: string;
}

export function useSavingsGoals() {
  const { data: merchant } = useMerchant();

  return useQuery({
    queryKey: ['savings', merchant?.id],
    queryFn: async () => {
      if (!merchant) return [];

      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!merchant,
  });
}

export function useTotalSavings() {
  const { data: goals } = useSavingsGoals();

  return {
    total: goals?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0,
    goalsCount: goals?.length || 0,
  };
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  const { data: merchant } = useMerchant();

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!merchant) throw new Error('Merchant not found');

      const { error } = await supabase.from('savings_goals').insert({
        merchant_id: merchant.id,
        name: input.name,
        target_amount: input.target_amount,
        deadline: input.deadline || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: number }) => {
      const { error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}

export function useAddDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      // Get current amount
      const { data: goal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const newAmount = Number(goal.current_amount) + amount;
      const isCompleted = newAmount >= Number(goal.target_amount);

      const { error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newAmount,
          is_completed: isCompleted,
        })
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
    },
  });
}
