import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import ProductImageUploader from "./ProductImageUploader";
import { createProductNotification } from "@/services/adminNotificationService";

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
     
              try {
                await createProductNotification(formData.name, 'new', formData.code,
                   formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                 );
              } catch (notifErr) {
                console.error("Failed to send in-app notification:", notifErr);
              }
           
      onProductAdded();
      onClose();
    } catch (error) {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };
 return (
  <Card className="bg-black text-white border-neutral-800">
    <CardHeader className="border-b border-neutral-800 p-4">
      <CardTitle className="flex justify-between items-center text-lg">
        Add Product
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-6 p-4">

      {/* BASIC INFO */}
      <div className="space-y-4 rounded-xl border border-neutral-800 p-4">
        <p className="font-semibold text-base">Basic Information</p>

        <div className="space-y-3">
          <Label className="text-sm">Product Name *</Label>
          <Input
            className="bg-neutral-900 border-neutral-700 text-white"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm">Product Code *</Label>
          <Input
            className="bg-neutral-900 border-neutral-700 text-white"
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm">Description</Label>
          <Textarea
            className="bg-neutral-900 border-neutral-700 text-white"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              handleInputChange("description", e.target.value)
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm">Price *</Label>
            <Input
              type="number"
              className="bg-neutral-900 border-neutral-700 text-white"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Original Price</Label>
            <Input
              type="number"
              className="bg-neutral-900 border-neutral-700 text-white"
              value={formData.original_price}
              onChange={(e) =>
                handleInputChange(
                  "original_price",
                  parseFloat(e.target.value) || 0
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Category *</Label>
          <Input
            className="bg-neutral-900 border-neutral-700 text-white"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
          />
        </div>
      </div>


      {/* IMAGES */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <p className="font-semibold text-base mb-3">Product Images</p>
        <ProductImageUploader
          mainImage={formData.image}
          additionalImages={formData.images}
          onMainImageChange={(url) => handleInputChange("image", url)}
          onAdditionalImagesChange={(urls) => handleInputChange("images", urls)}
          productName={formData.name}
        />
      </div>


      {/* TAGS */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <p className="font-semibold text-base mb-3">Tags</p>

        <div className="flex gap-2">
          <Input
            placeholder="Enter tag"
            value={newTag}
            className="bg-neutral-900 border-neutral-700 text-white"
            onChange={(e) => setNewTag(e.target.value)}
          />
          <Button onClick={addTag} className="bg-neutral-700 hover:bg-neutral-600">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-neutral-800 text-xs px-3 py-1 rounded-full flex items-center"
            >
              {tag}
              <button onClick={() => removeTag(index)} className="ml-2 text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>


      {/* VARIANTS */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <p className="font-semibold text-base mb-3">Sizes & Stock</p>

        <Button
          type="button"
          onClick={addVariant}
          className="bg-neutral-700 hover:bg-neutral-600 w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Size Variant
        </Button>

        <div className="space-y-3 mt-4">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="bg-neutral-900 flex gap-3 p-3 rounded-lg border border-neutral-700"
            >
              <Input
                placeholder="Size"
                value={variant.size}
                className="bg-neutral-800 text-white border-neutral-700"
                onChange={(e) => updateVariant(index, "size", e.target.value)}
              />

              <Input
                placeholder="Stock"
                type="number"
                value={variant.stock}
                className="bg-neutral-800 text-white border-neutral-700"
                onChange={(e) =>
                  updateVariant(index, "stock", parseInt(e.target.value) || 0)
                }
              />

              <Button
                size="icon"
                variant="destructive"
                disabled={variants.length === 1}
                onClick={() => removeVariant(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-2">
          Total Stock: <span className="text-white font-medium">
            {variants.reduce((sum, v) => sum + v.stock, 0)}
          </span>
        </p>
      </div>
    </CardContent>

    {/* STICKY BOTTOM BUTTONS */}
    <div className="sticky bottom-0 bg-black border-t border-neutral-900 p-4 flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="w-1/2 border-neutral-600 text-white"
      >
        Cancel
      </Button>

      <Button type="submit" disabled={loading} className="w-1/2 bg-red-600">
        {loading ? "Adding..." : "Add Product"}
      </Button>
    </div>
  </Card>
);

};

export default AddProductForm;