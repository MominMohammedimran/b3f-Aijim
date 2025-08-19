
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Package, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant } from '@/lib/types';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    image: '',
    images: [] as string[],
    category: '',
    stock: 0,
    tags: [] as string[],
    sizes: [] as ProductVariant[]
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProducts: Product[] = data?.map(item => ({
        id: item.id,
        code: item.code || `PROD-${item.id.slice(0, 8)}`,
        name: item.name,
        description: item.description || '',
        price: item.price,
        originalPrice: item.original_price || item.price,
        discountPercentage: item.discount_percentage || 0,
        image: item.image || '',
        images: Array.isArray(item.images) ? item.images.filter(img => typeof img === 'string') : [],
        category: item.category || '',
        stock: item.stock || 0,
        sizes: (() => {
          try {
            const raw = item.sizes;
            if (Array.isArray(raw)) {
              return raw
                .filter((v): v is any => v && typeof v === 'object' && 'size' in v && 'stock' in v)
                .map((v) => ({
                  size: String(v.size),
                  stock: Number(v.stock),
                })) as ProductVariant[];
            }
          } catch (err) {
            console.warn('Failed to parse sizes:', err);
          }
          return [];
        })(),
        tags: Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : [],
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      price: 0,
      originalPrice: 0,
      discountPercentage: 0,
      image: '',
      images: [],
      category: '',
      stock: 0,
      tags: [],
      sizes: []
    });
    setShowAddDialog(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discountPercentage: product.discountPercentage || 0,
      image: product.image,
      images: product.images || [],
      category: product.category,
      stock: product.stock || 0,
      tags: product.tags || [],
      sizes: product.sizes || []
    });
    setShowEditDialog(true);
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        code: formData.code,
        slug: formData.code.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: formData.price,
        original_price: formData.originalPrice,
        discount_percentage: formData.discountPercentage,
        image: formData.image,
        images: formData.images as any,
        category: formData.category,
        stock: formData.stock,
        sizes: formData.sizes as any,
        tags: formData.tags as any,
      };

      if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);
        
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
        toast.success('Product added successfully');
      }

      setShowEditDialog(false);
      setShowAddDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Products">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </AdminLayout>
    );
  }

  const ProductForm = ({ isEdit }: { isEdit: boolean }) => (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "name" : "add-name"} className="text-white">Product Name</Label>
          <Input
            id={isEdit ? "name" : "add-name"}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter product name"
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor={isEdit ? "code" : "add-code"} className="text-white">Product Code</Label>
          <Input
            id={isEdit ? "code" : "add-code"}
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="Enter product code"
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEdit ? "price" : "add-price"} className="text-white">Price</Label>
          <Input
            id={isEdit ? "price" : "add-price"}
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor={isEdit ? "stock" : "add-stock"} className="text-white">Stock</Label>
          <Input
            id={isEdit ? "stock" : "add-stock"}
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={isEdit ? "category" : "add-category"} className="text-white">Category</Label>
        <Input
          id={isEdit ? "category" : "add-category"}
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          placeholder="Enter category"
          className="bg-gray-700 text-white border-gray-600"
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? "description" : "add-description"} className="text-white">Description</Label>
        <Textarea
          id={isEdit ? "description" : "add-description"}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter product description"
          className="bg-gray-700 text-white border-gray-600"
        />
      </div>

      <div>
        <Label htmlFor={isEdit ? "image" : "add-image"} className="text-white">Main Image URL</Label>
        <Input
          id={isEdit ? "image" : "add-image"}
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          placeholder="Enter main image URL"
          className="bg-gray-700 text-white border-gray-600"
        />
      </div>

      <div>
        <Label className="text-white">Additional Image URLs</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="bg-gray-700 text-white border-gray-600"
          />
          <Button onClick={addImageUrl} type="button" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.images.map((url, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 text-white">
              <span className="flex-1 text-sm truncate">{url}</span>
              <Button
                onClick={() => removeImageUrl(index)}
                type="button"
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {setShowEditDialog(false); setShowAddDialog(false);}} className="text-gray-800">
          Cancel
        </Button>
        <Button onClick={handleSaveProduct} className="bg-blue-600 hover:bg-blue-700">
          {isEdit ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>
          <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-gray-700 border-gray-600 text-white">
              <div className="aspect-video bg-gray-600 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                  <Badge variant={product.stock && product.stock > 0 ? "default" : "destructive"}>
                    {product.stock && product.stock > 0 ? 'Stock' : 'Out of Stock'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{product.code}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">₹{product.price}</span>
                  <span className="text-sm text-gray-300">Stock: {product.stock || 0}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 text-white border-gray-600 hover:bg-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-600 border-gray-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No products found</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm isEdit={true} />
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm isEdit={false} />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
