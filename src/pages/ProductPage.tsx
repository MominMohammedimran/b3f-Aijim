
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/lib/types';

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        code: 'PROD-001',
        name: 'Sample Product 1',
        description: 'Description for product 1',
        price: 99.99,
        originalPrice: 129.99,
        discountPercentage: 20,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500',
        images: [],
        category: 'Electronics',
        stock: 10,
        variants: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 3 },
          { size: 'L', stock: 2 }
        ],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 3 },
          { size: 'L', stock: 2 }
        ],
        tags: ['featured', 'sale']
      }
    ];
    
    setProducts(mockProducts);
    
    const uniqueCategories = Array.from(new Set(mockProducts.map(p => p.category)));
    setCategories(uniqueCategories);
  }, []);

  return (
    <Layout>
      <div className="container-custom mt-10 mb-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          </aside>
          <main className="flex-1">
            <ProductGrid products={products} loading={false} />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
