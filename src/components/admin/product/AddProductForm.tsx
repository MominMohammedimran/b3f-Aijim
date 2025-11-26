import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface ProductVariant {
  size: string;
  stock: number;
}

interface AddProductFormProps {
  onProductAdded: () => void;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onProductAdded,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price: 0,
    original_price: 0,
    discount_percentage: 0,
    category: "",
    image: "",
    images: [] as string[],
    tags: [] as string[],
    seo_keywords: [] as string[], // ⭐ ADDED
  });

  const [newSEOKeyword, setNewSEOKeyword] = useState(""); // ⭐ ADDED

  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: "", stock: 0 },
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSEOKeyword = () => {
    if (!newSEOKeyword.trim()) return;

    // Split input into multiple keywords (comma separated)
    const keywordList = newSEOKeyword
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    // Combine and remove duplicates using Set
    const updatedKeywords = Array.from(
      new Set([...formData.seo_keywords, ...keywordList])
    );

    // Update state
    handleInputChange("seo_keywords", updatedKeywords);

    // Clear input field
    setNewSEOKeyword("");

    toast.success(`${keywordList.length} keyword(s) added`);
  };

  const removeSEOKeyword = (index: number) => {
    handleInputChange(
      "seo_keywords",
      formData.seo_keywords.filter((_, i) => i !== index)
    );
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", stock: 0 }]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
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
      handleInputChange("images", [...formData.images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    handleInputChange(
      "images",
      formData.images.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    handleInputChange(
      "tags",
      formData.tags.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.code ||
      !formData.category ||
      !formData.price
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const cleanedVariants = variants.filter((v) => v.size && v.stock >= 0);
      const totalStock = cleanedVariants.reduce((sum, v) => sum + v.stock, 0);

      const productData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price || formData.price,
        discount_percentage: formData.discount_percentage || 0,
        category: formData.category,
        image: formData.image,
        images: formData.images.length > 0 ? (formData.images as any) : null,
        tags: formData.tags.length > 0 ? (formData.tags as any) : null,

        // ⭐ ADDED SEO KEYWORDS
        seo_keywords:
          formData.seo_keywords.length > 0
            ? (formData.seo_keywords as any)
            : null,

        sizes:
          cleanedVariants.length > 0
            ? (cleanedVariants.map((v) => v.size) as any)
            : null,
        variants: cleanedVariants.length > 0 ? (cleanedVariants as any) : null,
        stock: totalStock,
        is_active: true,
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      };

      const { error } = await supabase.from("products").insert([productData]);

      if (error) throw error;

      toast.success("Product added successfully");
      onProductAdded();
      onClose();
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Add New Product
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid  gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Product Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid 3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
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
                    onChange={(e) =>
                      handleInputChange(
                        "original_price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="discount_percentage">Discount %</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      handleInputChange(
                        "discount_percentage",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  required
                />
              </div>

              {/* Main Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Main Image</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      placeholder="Enter main image URL"
                      value={formData.image}
                      onChange={(e) =>
                        handleInputChange("image", e.target.value)
                      }
                    />
                    {formData.image && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleInputChange("image", "")}
                      >
                        <X className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>

                  {formData.image && (
                    <div className="flex items-center gap-3 p-2 border rounded">
                      <img
                        src={formData.image}
                        alt="Main"
                        className="w-20 h-20 object-cover rounded"
                      />
                      <span className="flex-1 text-sm truncate">
                        {formData.image}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
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
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/*product seo keywords*/}
          <Card>
            <CardHeader>
              <CardTitle>SEO Keywords</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add SEO keyword (e.g., blue tshirt)"
                  value={newSEOKeyword}
                  onChange={(e) => setNewSEOKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSEOKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addSEOKeyword}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.seo_keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center"
                  >
                    <span>{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeSEOKeyword(index)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
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
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded"
                  >
                    <div className="flex-1">
                      <Label>Size</Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        placeholder="e.g., S, M, L, XL"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
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
                    Total Stock: {variants.reduce((sum, v) => sum + v.stock, 0)}{" "}
                    units
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddProductForm;
