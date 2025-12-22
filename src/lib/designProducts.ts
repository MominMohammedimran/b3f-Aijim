export interface DesignProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  variants: { size: string; stock: number }[];
}

export interface DesignProductsMap {
  [key: string]: DesignProduct;
}

export const getDesignProducts = (sizeInventory: Record<string, Record<string, number>>): DesignProductsMap => ({
  tshirt: { 
    id: 'tshirt',
    name: 'T-Shirt', 
    price: 249, 
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/tshirt-print/tshirt-print.webp',
    variants: [
      { size: 'S', stock: sizeInventory.tshirt?.s || 0 },
      { size: 'M', stock: sizeInventory.tshirt?.m || 0 },
      { size: 'L', stock: sizeInventory.tshirt?.l || 0 },
      { size: 'XL', stock: sizeInventory.tshirt?.xl || 0 },
      { size: 'XXL', stock: sizeInventory.tshirt?.xxl || 0 }
    ]
  },
  mug: { 
    id: 'mug',
    name: 'Mug', 
    price: 199, 
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/mug-print/mug-print.webp',
    variants: [
      { size: 'Standard', stock: sizeInventory.mug?.standard || 0 }
    ]
  },
  cap: { 
    id: 'cap',
    name: 'Cap', 
    price: 179, 
    image: 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/cap-print/cap-print.webp',
    variants: [
      { size: 'Standard', stock: sizeInventory.cap?.standard || 0 }
    ]
  },
  photo_frame: { 
    id: 'photo_frame',
    name: 'Photo Frame', 
    price: 299, 
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300',
    variants: [
      { size: '8X12inch', stock: 0 },
      { size: '12x16inch', stock: 0 },
      { size: '5x7 inch', stock: 0 }
    ]
  }
});

export const CUSTOMIZABLE_PRODUCT_CODES = ['TSHIRT', 'MUG', 'CAP', 'PHOTO_FRAME'];

export const isCustomizableProduct = (code: string): boolean => {
  const upperCode = code?.toUpperCase() || '';
  return CUSTOMIZABLE_PRODUCT_CODES.some(c => upperCode.includes(c));
};
