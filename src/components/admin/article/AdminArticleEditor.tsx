import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadToImageKit } from '@/lib/imagekit';
import { Article } from '@/lib/types';

const AdminArticleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEditing = Boolean(slug);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'AIJIM',
    category: '',
    tags: '',
    is_published: false,
  });

  useEffect(() => {
    if (isEditing && slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', articleSlug)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          content: data.content,
          image: data.image || '',
          author: data.author || 'AIJIM',
          category: data.category || '',
          tags: data.tags?.join(', ') || '',
          is_published: data.is_published || false,
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToImageKit(file, 'articles');
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        image: formData.image || null,
        author: formData.author,
        category: formData.category || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('slug', slug);

        if (error) throw error;
        toast.success('Article updated successfully');
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;
        toast.success('Article created successfully');
      }

      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error(error.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/articles')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Article' : 'Create Article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="article-url-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the article"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content here... (Markdown supported)"
                rows={15}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              {formData.image && (
                <div className="w-40 h-24 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={formData.image} 
                    alt="Featured" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Fashion, Style"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., streetwear, fashion, trends"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Publish Article</Label>
                <p className="text-sm text-muted-foreground">
                  Make this article visible to the public
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/articles')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Article' : 'Create Article'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminArticleEditor;