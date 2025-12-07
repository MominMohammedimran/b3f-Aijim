import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { uploadToImageKit } from '@/lib/imagekit';
import { toast } from 'sonner';

interface ImageKitUploadProps {
  mainImage?: string;
  additionalImages?: string[];
  onMainImageChange: (url: string) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
  folder: string;
}

const ImageKitUpload: React.FC<ImageKitUploadProps> = ({
  mainImage,
  additionalImages = [],
  onMainImageChange,
  onAdditionalImagesChange,
  folder
}) => {
  const [uploading, setUploading] = useState(false);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file, folder);
      onMainImageChange(url);
      toast.success('Main image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map(file => uploadToImageKit(file, folder));
      const urls = await Promise.all(uploadPromises);
      onAdditionalImagesChange([...additionalImages, ...urls]);
      toast.success('Additional images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    onAdditionalImagesChange(newImages);
  };

  const removeMainImage = () => {
    onMainImageChange('');
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Images</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload images to ImageKit (folder: {folder})
        </p>
      </div>

      {/* Main Image */}
      <div className="space-y-2">
        <Label htmlFor="mainImage">Main Image</Label>
        <div className="flex items-start gap-4">
          <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border">
            {mainImage ? (
              <>
                <img 
                  src={mainImage} 
                  alt="Main" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeMainImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id="mainImage"
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 800x800px
            </p>
          </div>
        </div>
      </div>

      {/* Additional Images */}
      <div className="space-y-2">
        <Label htmlFor="additionalImages">Additional Images</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {additionalImages.map((imageUrl, index) => (
            <div key={index} className="relative">
              <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`View ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => removeAdditionalImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          <label className="cursor-pointer flex items-center justify-center w-full aspect-square bg-muted/50 border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors">
            <div className="text-center">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">Add Images</span>
            </div>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImageUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Uploading to ImageKit...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageKitUpload;