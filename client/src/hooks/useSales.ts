import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useMerchant } from './useMerchant';

type SaleRow = { total_amount: number | string };

export interface Sale {
  id: number;
  merchant_id: number;
  product_id: number | null;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  sale_date: string;
  is_synced: boolean;
  voice_input: boolean;
  created_at: string;
}

export interface CreateSaleInput {
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  payment_method?: string;
  voice_input?: boolean;
}

export function useSales(limit = 50) {
  const { data: merchant } = useMerchant();

  return useQuery({
    queryKey: ['sales', merchant?.id, limit],
    queryFn: async () => {
      if (!merchant) return [];

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('sale_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!merchant,
  });
}

export function useTodaySales() {
  const { data: merchant } = useMerchant();

  return useQuery({
    queryKey: ['sales', 'today', merchant?.id],
    queryFn: async () => {
      if (!merchant) return { totalSales: 0, totalAmount: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('merchant_id', merchant.id)
        .gte('sale_date', today.toISOString());

      if (error) throw error;

      const totalAmount = (data as SaleRow[]).reduce((sum: number, sale: SaleRow) => sum + Number(sale.total_amount), 0);
      return {
        totalSales: data.length,
        totalAmount,
      };
    },
    enabled: !!merchant,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  const { data: merchant } = useMerchant();

  return useMutation({
    mutationFn: async (input: CreateSaleInput) => {
      if (!merchant) throw new Error('Merchant not found');

      const saleData = {
        merchant_id: merchant.id,
        product_id: input.product_id || null,
        product_name: input.product_name,
        quantity: input.quantity,
        unit_price: input.unit_price,
        total_amount: input.quantity * input.unit_price,
        payment_method: input.payment_method || 'cash',
        voice_input: input.voice_input || false,
        sale_date: new Date().toISOString(),
      };

      const { error } = await supabase.from('sales').insert(saleData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
