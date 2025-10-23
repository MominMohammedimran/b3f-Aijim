
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface ProductVariant {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  category: string;
  image?: string;
  images?: string[];
  tags?: string[];
  sizes?: ProductVariant[];
  variants?: ProductVariant[];
  stock?: number;
  is_active?: boolean;
}

interface EditProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onProductUpdated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: 0,
    original_price: 0,
    discount_percentage: 0,
    category: '',
    image: '',
    images: [] as string[],
    tags: [] as string[],
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        description: product.description || '',
        price: product.price || 0,
        original_price: product.original_price || 0,
        discount_percentage: product.discount_percentage || 0,
        category: product.category || '',
        image: product.image || '',
        images: product.images || [],
        tags: product.tags || [],
      });

      const productVariants = product.variants || product.sizes || [];
      setVariants(productVariants.length > 0 ? productVariants : [{ size: '', stock: 0 }]);
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', stock: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      handleInputChange('images', [...formData.images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    handleInputChange('images', formData.images.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !formData.name || !formData.code || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const cleanedVariants = variants.filter(v => v.size && v.stock >= 0);
      const totalStock = cleanedVariants.reduce((sum, v) => sum + v.stock, 0);

      const updateData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price || formData.price,
        discount_percentage: formData.discount_percentage || 0,
        category: formData.category,
        image: formData.image,
        images: formData.images.length > 0 ? formData.images as any : null,
        tags: formData.tags.length > 0 ? formData.tags as any : null,
        sizes: cleanedVariants.length > 0 ? cleanedVariants.map(v => v.size) as any : null,
        variants: cleanedVariants.length > 0 ? cleanedVariants as any : null,
        stock: totalStock,
        updated_at: new Date().toISOString(),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (error) {
       // console.error('Error updating product:', error);
        throw error;
      }

      toast.success('Product updated successfully');
      onProductUpdated();
      onClose();
    } catch (error) {
    //  console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="code">Product Code *</Label>
                  <Input 
                    id="code" 
                    value={formData.code} 
                    onChange={(e) => handleInputChange('code', e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="original_price">Original Price</Label>
                  <Input 
                    id="original_price" 
                    type="number" 
                    step="0.01" 
                    value={formData.original_price} 
                    onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div>
                  <Label htmlFor="discount_percentage">Discount %</Label>
                  <Input 
                    id="discount_percentage" 
                    type="number" 
                    value={formData.discount_percentage} 
                    onChange={(e) => handleInputChange('discount_percentage', parseFloat(e.target.value) || 0)} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input 
                  id="category" 
                  value={formData.category} 
                  onChange={(e) => handleInputChange('category', e.target.value)} 
                  required 
                />
              </div>

              <div>
                <Label htmlFor="image">Main Image URL</Label>
                <Input 
                  id="image" 
                  value={formData.image} 
                  onChange={(e) => handleInputChange('image', e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button type="button" onClick={addImage}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <img src={url} alt={`Product ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Product Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(index)} className="ml-1 text-blue-600 hover:text-blue-800">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Variants & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" onClick={addVariant} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Size Variant
              </Button>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <div className="flex-1">
                      <Label>Size</Label>
                      <Input 
                        value={variant.size} 
                        onChange={(e) => updateVariant(index, 'size', e.target.value)} 
                        placeholder="e.g., S, M, L, XL" 
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Stock</Label>
                      <Input 
                        type="number" 
                        value={variant.stock} 
                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)} 
                        min="0" 
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => removeVariant(index)}
                      disabled={variants.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {variants.length > 0 && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    Total Stock: {variants.reduce((sum, v) => sum + v.stock, 0)} units
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductForm;
