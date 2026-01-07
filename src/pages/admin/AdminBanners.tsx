import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Trash2, Edit, PlusCircle, Monitor, Smartphone, X, ImageOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Database } from '@/integrations/supabase/types';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Banner = Database['public']['Tables']['banners']['Row'];
type BannerImages = { desktop: string[]; mobile: string[] };

const ImageCarouselPreview = ({ urls }: { urls: string[] }) => {
    const validUrls = urls.filter(url => url && url.trim() !== '');

    if (validUrls.length === 0) {
        return (
             <div className="mt-4 rounded-md border border-dashed border-gray-200 p-2 h-32 flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 flex flex-col items-center">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-xs mt-1">No images to preview</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 h-40 select-none">
            <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                loop={validUrls.length > 1}
                className="w-full h-full bg-gray-100 rounded-md border"
            >
                {validUrls.map((url, index) => (
                    <SwiperSlide key={index} className="flex items-center justify-center p-2">
                        <img src={url} alt={`Preview ${index + 1}`} className="max-h-full max-w-full object-contain rounded-sm" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};


const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner> | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [imageInputs, setImageInputs] = useState<BannerImages>({ desktop: [], mobile: [] });

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('banners').select('*').order('created_at');
      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch banners:', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleEdit = (banner: Banner) => {
    setCurrentBanner(banner);
    const images = banner.images as unknown as BannerImages;
    setImageInputs({ desktop: images?.desktop || [], mobile: images?.mobile || [] });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setCurrentBanner({ title: '', is_active: false });
    setImageInputs({ desktop: [''], mobile: [''] });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!currentBanner?.title) {
        toast.error("Banner title cannot be empty.");
        return;
    }

    const upsertData = {
      title: currentBanner.title,
      images: { 
          desktop: imageInputs.desktop.filter(url => url), // Remove empty strings
          mobile: imageInputs.mobile.filter(url => url)
      },
      is_active: currentBanner.id ? currentBanner.is_active : false, // Default new banners to inactive
    };
    
    const promise = async () => {
      if (currentBanner.id) {
        const { error } = await supabase.from('banners').update(upsertData).eq('id', currentBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(upsertData).select().single();
        if (error) throw error;
      }
    };

    toast.promise(promise(), {
        loading: `Saving banner...`,
        success: () => {
            setIsFormOpen(false);
            fetchBanners();
            return `Banner saved successfully!`
        },
        error: (err) => `Failed to save banner: ${err.message}`
    });
  };

  const handleDelete = (banner: Banner) => {
      setBannerToDelete(banner);
      setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!bannerToDelete) return;

    const promise = async () => {
        const { error } = await supabase.from('banners').delete().eq('id', bannerToDelete.id);
        if (error) throw error;
    }

    toast.promise(promise(), {
        loading: 'Deleting banner...',
        success: () => {
            setIsDeleteDialogOpen(false);
            setBannerToDelete(null);
            fetchBanners();
            return "Banner deleted successfully";
        },
        error: (err) => `Failed to delete banner: ${err.message}`
    });
  };
  
  const handleToggleActive = async (banner: Banner) => {
    const newActiveState = !banner.is_active;

    const promise = async () => {
        if (newActiveState) {
            const { error: updateError } = await supabase.from('banners').update({ is_active: false }).eq('is_active', true);
            if (updateError) throw updateError;
        }

        const { error } = await supabase.from('banners').update({ is_active: newActiveState }).eq('id', banner.id);
        if (error) throw error;
    }

    toast.promise(promise(), {
        loading: 'Updating status...',
        success: () => {
            fetchBanners();
            return "Banner status updated successfully.";
        },
        error: (err) => `Failed to update status: ${err.message}`
    });
  };
  
  const handleImageInputChange = (type: 'desktop' | 'mobile', index: number, value: string) => {
    const newImages = { ...imageInputs };
    newImages[type][index] = value;
    setImageInputs(newImages);
  }
  
  const addImageInput = (type: 'desktop' | 'mobile') => {
      const newImages = { ...imageInputs };
      newImages[type].push('');
      setImageInputs(newImages);
  }
  
  const removeImageInput = (type: 'desktop' | 'mobile', index: number) => {
      const newImages = { ...imageInputs };
      newImages[type].splice(index, 1);
      setImageInputs(newImages);
  }

  if (loading) {
    return (
        <ModernAdminLayout title="Banners">
            <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>
        </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout title="Banners">
        <div className="container mx-auto py-6 px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Banners</h1>
                <Button onClick={handleAddNew} size="sm">
                    <PlusCircle className="mr-0 sm:mr-2 h-4 w-4"/> 
                    <span className="hidden sm:inline">Add New Banner</span>
                </Button>
            </div>
    
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {banners.map((banner) => {
                    const images = banner.images as unknown as BannerImages;
                    return (
                    <Card key={banner.id} className="flex flex-col text-sm">
                        <CardHeader>
                            <CardTitle className="flex items-start justify-between">
                                <span className="truncate mr-4 font-semibold">{banner.title}</span>
                                <Badge variant={banner.is_active ? 'default' : 'secondary'} className={`whitespace-nowrap ${banner.is_active ? 'bg-green-600 text-white' : ''}`}>{banner.is_active ? 'Active' : 'Inactive'}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="flex items-center text-gray-500 mb-2">
                               <Monitor className="h-4 w-4 mr-2"/> 
                               <span>{images?.desktop?.length || 0} Desktop images</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                               <Smartphone className="h-4 w-4 mr-2"/> 
                               <span>{images?.mobile?.length || 0} Mobile images</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 bg-gray-50 p-3 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Activate</span>
                                <Switch checked={banner.is_active} onCheckedChange={() => handleToggleActive(banner)} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(banner)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(banner)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </CardFooter>
                    </Card>
                )})}
            </div>
        </div>

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-4xl py-10 mt-5">
                <DialogHeader>
                    <DialogTitle>{currentBanner?.id ? 'Edit' : 'Create'} Banner</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4 max-h-[75vh] overflow-y-auto pr-6">
                    <Input
                        id="title"
                        placeholder="Banner Title (e.g., 'Summer Sale')"
                        value={currentBanner?.title || ''}
                        onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                        className="font-semibold text-lg"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        {/* Desktop Section */}
                        <div className="rounded-lg border p-4 flex flex-col">
                            <h3 className="font-semibold flex items-center mb-4"><Monitor className="mr-2 h-5 w-5"/>Desktop Images</h3>
                             <div className="space-y-2 mb-4 flex-grow">
                                {imageInputs.desktop.map((url, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <Input value={url} onChange={(e) => handleImageInputChange('desktop', i, e.target.value)} placeholder="https://.../desktop.jpg" />
                                        <Button variant="ghost" size="icon" onClick={() => removeImageInput('desktop', i)}><X className="h-4 w-4 text-gray-500" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full mb-4" onClick={() => addImageInput('desktop')}><PlusCircle className="mr-2 h-4 w-4" />Add Desktop URL</Button>
                            <ImageCarouselPreview urls={imageInputs.desktop} />
                        </div>

                        {/* Mobile Section */}
                        <div className="rounded-lg border p-4 flex flex-col">
                             <h3 className="font-semibold flex items-center mb-4"><Smartphone className="mr-2 h-5 w-5"/>Mobile Images</h3>
                             <div className="space-y-2 mb-4 flex-grow">
                                {imageInputs.mobile.map((url, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <Input value={url} onChange={(e) => handleImageInputChange('mobile', i, e.target.value)} placeholder="https://.../mobile.jpg" />
                                        <Button variant="ghost" size="icon" onClick={() => removeImageInput('mobile', i)}><X className="h-4 w-4 text-gray-500" /></Button>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full mb-4" onClick={() => addImageInput('mobile')}><PlusCircle className="mr-2 h-4 w-4" />Add Mobile URL</Button>
                             <ImageCarouselPreview urls={imageInputs.mobile} />
                        </div>
                    </div>
                </div>
                <DialogFooter className="border-t pt-4 mt-2">
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-red-500"/>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Are you sure you want to delete the banner <strong className='px-1'>{bannerToDelete?.title}</strong>? This action cannot be undone.</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Banner</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </ModernAdminLayout>
  );
};

export default AdminBanners;
