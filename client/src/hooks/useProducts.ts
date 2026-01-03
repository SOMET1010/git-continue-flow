import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: number;
  name: string;
  name_dioula: string | null;
  category: string | null;
  unit: string;
  base_price: number | null;
  image_url: string | null;
  pictogram_url: string | null;
  is_active: boolean;
  created_at: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductsByCategory(category?: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data as Product[];
    },
  });
}
