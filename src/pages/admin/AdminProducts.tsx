import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import ModernAdminLayout from "../../components/admin/ModernAdminLayout";
import AddProductForm from "../../components/admin/product/AddProductForm";
import EditProductForm from "../../components/admin/product/EditProductForm";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*") // includes seo_keywords JSONB
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setShowEditDialog(true);
  };

  const handleProductAdded = () => {
    fetchProducts();
    setShowAddForm(false);
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setShowEditDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <ModernAdminLayout title="Products">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Product Management</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showAddForm && (
          <AddProductForm
            onProductAdded={handleProductAdded}
            onClose={() => setShowAddForm(false)}
          />
        )}

        <EditProductForm
          product={selectedProduct}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onProductUpdated={handleProductUpdated}
        />

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No products found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <strong>Code:</strong> {product.code}
                      </p>
                      <p>
                        <strong>Price:</strong> ₹{product.price}
                      </p>
                      <p>
                        <strong>Original Price:</strong> ₹
                        {product.original_price || "N/A"}
                      </p>
                      <p>
                        <strong>Category:</strong> {product.category}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Stock:</strong> {product.stock || 0}
                      </p>
                      <p>
                        <strong>Rating:</strong> {product.rating || 0}
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {formatDate(product.created_at)}
                      </p>
                    </div>
                  </div>

                  {product.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* ⭐ ADDING SEO KEYWORDS DISPLAY */}
                  {product.seo_keywords && product.seo_keywords.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-sm mb-1">SEO Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.seo_keywords.map((kw: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.images && product.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Additional Images:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {product.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminProducts;
