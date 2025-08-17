
/* lib/data/products.ts */
import { Product,Category } from './types';
import { supabase } from '@/integrations/supabase/client';

let _products: Product[] = [];
let loaded = false;

/** Parse sizes: [{ size: string, stock: number }] from Supabase `jsonb` */
function parseSizes(raw: any): { size: string; stock: number }[] {
  try {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((v) => v && typeof v === 'object' && v.size && v.stock != null)
      .map((v) => ({
        size: String(v.size),
        stock: Number(v.stock),
      }));
  } catch (err) {
    console.warn('❌ Failed to parse sizes:', err, raw);
    return [];
  }
}

async function fetchProductsOnce(): Promise<Product[]> {
  if (loaded) return _products;

  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('❌ Supabase fetch error:', error);
    return [];
  }

  _products = (data || []).map((p: any) => ({
    id: String(p.id),
    productId: String(p.product_id ?? p.id),
    code: p.code || `PROD-${String(p.id).slice(0, 8)}`,
    name: p.name || '',
    description: p.description || '',
    price: p.price ?? 0,
    originalPrice: p.original_price ?? p.price ?? 0,
    discountPercentage: p.discount_percentage ?? 0,
    image: p.image || '',
    images: Array.isArray(p.images) ? p.images.map(String) : [],
    additionalImages: Array.isArray(p.additional_images) ? p.additional_images.map(String) : [],
    rating: p.rating ?? 0,
    category: p.category || '',
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    stock: p.stock ?? 0,
    sizes: parseSizes(p.sizes), // ✅ this is now your main source of size + stock
  }));

  loaded = true;
  return _products;
}

// Export dynamic array that gets filled once
export const products: Product[] = [];
fetchProductsOnce().then((result) => {
  products.splice(0, products.length, ...result);
});

export const categories: Category[] = [
  {
    id: '1',
    name: 'T-Shirt Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/tshirt-print.webp'
  },
  {
    id: '2', 
    name: 'Mug Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/mug-print.webp'
  },
  {
    id: '3',
    name: 'Cap Print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/cap-print.webp'
  },
   {
    id: '4',
    name: 'Photo print',
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/hero-categorie/cap-print.webp'
  },
  
];

// Mock orders data for OrdersHistory component
export const orders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        product_id: 'tshirt',
        name: 'Custom T-Shirt',
        image: '/aijim-uploads/aijim.png',
        price: 250,
        quantity: 1
      }
    ],
    total: 250,
    status: 'delivered' as const,
    paymentMethod: 'razorpay',
    shippingAddress: {},
    createdAt: '2024-01-15T10:00:00Z',
    date: '2024-01-15T10:00:00Z'
  }
];