
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductInventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  stock: number;
  variants?: any[];
  sizes?: any[];
}

export const fetchProductInventory = async (): Promise<ProductInventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, code, category, stock, variants, sizes')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code,
      category: item.category,
      stock: item.stock || 0,
      variants: Array.isArray(item.variants) ? item.variants : [],
      sizes: Array.isArray(item.sizes) ? item.sizes : []
    })) || [];
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    toast.error('Failed to fetch product inventory');
    return [];
  }
};

export const updateProductInventory = async (productId: string, updates: Partial<ProductInventoryItem>) => {
  try {
    const updateData: any = {};
    
    if (updates.stock !== undefined) {
      updateData.stock = updates.stock;
    }
    
    if (updates.variants) {
      updateData.variants = updates.variants;
    }
    
    if (updates.sizes) {
      updateData.sizes = updates.sizes;
    }

    const { error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) throw error;

    toast.success('Product inventory updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating product inventory:', error);
    toast.error('Failed to update product inventory');
    return false;
  }
};

export const createProduct = async (productData: Omit<ProductInventoryItem, 'id'> & { 
  price: number;
  original_price: number;
  description?: string;
  image?: string;
  slug: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        code: productData.code,
        category: productData.category,
        stock: productData.stock,
        price: productData.price,
        original_price: productData.original_price,
        description: productData.description || '',
        image: productData.image || '',
        slug: productData.slug,
        variants: productData.variants || [],
        sizes: productData.sizes || [],
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    toast.success('Product created successfully');
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Failed to create product');
    return null;
  }
};
