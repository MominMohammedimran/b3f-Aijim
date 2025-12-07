import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ImagePlus, Loader2, Plus, Link } from 'lucide-react';
import { uploadToImageKit } from '@/lib/imagekit';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductImageUploaderProps {
  mainImage: string;
  additionalImages: string[];
  onMainImageChange: (url: string) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
  productName:string;
}

const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  mainImage,
  additionalImages,
  onMainImageChange,
  onAdditionalImagesChange,
  productName,
}) => {
  const [uploading, setUploading] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [additionalImageUrl, setAdditionalImageUrl] = useState('');
  const [folderInput, setFolderInput] = useState('');

  // 👉 Folder Logic
  const getFolder = () => {
    if (!folderInput.trim()) return "products";
    
    if (folderInput.startsWith("products")) return folderInput.trim();
    
    return `products/${folderInput.trim()}`;
  };

  const folder = getFolder();

 const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const folderPath = productName 
        ? `products/${productName.replace(/\s+/g, "-").toLowerCase()}` 
        : "products";

      const url = await uploadToImageKit(file, folderPath);

      onMainImageChange(url);
      toast.success("Main image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);

      const folderPath = productName 
        ? `products/${productName.replace(/\s+/g, "-").toLowerCase()}` 
        : "products";

      const urls = await Promise.all(
        files.map(file => uploadToImageKit(file, folderPath))
      );

      onAdditionalImagesChange([...additionalImages, ...urls]);
      toast.success("Images uploaded successfully");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  }

  const addMainImageUrl = () => {
    if (mainImageUrl.trim()) {
      onMainImageChange(mainImageUrl.trim());
      setMainImageUrl("");
    }
  };

  const addAdditionalImageUrl = () => {
    if (additionalImageUrl.trim()) {
      onAdditionalImagesChange([...additionalImages, additionalImageUrl.trim()]);
      setAdditionalImageUrl("");
    }
  };

  const removeAdditionalImage = (index: number) => {
    onAdditionalImagesChange(additionalImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">

      {/* 🔹 Folder Input */}
      <div className="space-y-2">
        <Label className="font-medium">Folder Name (optional)</Label>
        <Input
          placeholder="example: Aijim-Blue-001"
          value={folderInput}
          onChange={(e) => setFolderInput(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Final Path: <strong>{folder}</strong>
        </p>
      </div>

      {/* 🔹 Main Image */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Main Image</Label>

        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload"><Upload className="w-4" /> Upload</TabsTrigger>
            <TabsTrigger value="url"><Link className="w-4" /> URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer border-2 border-dashed rounded-lg p-3">
                {mainImage ? <img src={mainImage} className="w-32 h-32 rounded" /> : "Click to upload"}
                <Input type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url">
            <div className="flex gap-2">
              <Input value={mainImageUrl} onChange={e => setMainImageUrl(e.target.value)} placeholder="Paste URL" />
              <Button onClick={addMainImageUrl}><Plus /> Add</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 🔹 Additional Images */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Additional Images</Label>

        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload"><Upload className="w-4" /> Upload</TabsTrigger>
            <TabsTrigger value="url"><Link className="w-4" /> URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <label className="cursor-pointer border-2 border-dashed p-2 rounded-lg w-fit flex gap-2">
              <Upload className="w-4" /> Upload Images
              <Input type="file" multiple accept="image/*" onChange={handleAdditionalImageUpload} className="hidden" />
            </label>
          </TabsContent>

          <TabsContent value="url">
            <div className="flex gap-2">
              <Input value={additionalImageUrl} onChange={e => setAdditionalImageUrl(e.target.value)} placeholder="Paste URL" />
              <Button onClick={addAdditionalImageUrl}><Plus /> Add</Button>
            </div>
          </TabsContent>
        </Tabs>

        {additionalImages.map((url, i) => (
          <div key={i} className="flex gap-2 items-center p-2 border rounded-md bg-muted/20">
            <img src={url} className="w-12 h-12 rounded object-cover" />
            <Input value={url} onChange={(e) => {
              const updated = [...additionalImages];
              updated[i] = e.target.value;
              onAdditionalImagesChange(updated);
            }} />
            <Button variant="destructive" size="sm" onClick={() => removeAdditionalImage(i)}>
              <X />
            </Button>
          </div>
        ))}
      </div>

      {uploading && (
        <div className="flex justify-center text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
