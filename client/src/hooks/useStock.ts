import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMerchant } from './useMerchant';

export interface StockItem {
  id: number;
  merchant_id: number;
  product_id: number;
  quantity: number;
  min_threshold: number;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    unit: string;
    image_url: string | null;
  };
}

export function useStock() {
  const { data: merchant } = useMerchant();

  return useQuery({
    queryKey: ['stock', merchant?.id],
    queryFn: async () => {
      if (!merchant) return [];

      const { data, error } = await supabase
        .from('merchant_stock')
        .select(`
          *,
          product:products(id, name, unit, image_url)
        `)
        .eq('merchant_id', merchant.id);

      if (error) throw error;
      return data as StockItem[];
    },
    enabled: !!merchant,
  });
}

export function useLowStock() {
  const { data: merchant } = useMerchant();

  return useQuery({
    queryKey: ['stock', 'low', merchant?.id],
    queryFn: async () => {
      if (!merchant) return [];

      const { data, error } = await supabase
        .from('merchant_stock')
        .select(`
          *,
          product:products(id, name, unit, image_url)
        `)
        .eq('merchant_id', merchant.id)
        .lte('quantity', supabase.rpc('get_min_threshold'));

      // Fallback: fetch all and filter client-side
      if (error) {
        const { data: allStock, error: err2 } = await supabase
          .from('merchant_stock')
          .select(`
            *,
            product:products(id, name, unit, image_url)
          `)
          .eq('merchant_id', merchant.id);

        if (err2) throw err2;
        return (allStock as StockItem[]).filter(item => item.quantity <= item.min_threshold);
      }

      return data as StockItem[];
    },
    enabled: !!merchant,
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  const { data: merchant } = useMerchant();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      if (!merchant) throw new Error('Merchant not found');

      // Check if stock entry exists
      const { data: existing } = await supabase
        .from('merchant_stock')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('merchant_stock')
          .update({ 
            quantity, 
            last_restocked: new Date().toISOString() 
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('merchant_stock')
          .insert({
            merchant_id: merchant.id,
            product_id: productId,
            quantity,
            last_restocked: new Date().toISOString(),
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}
