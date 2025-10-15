
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import PasswordReset from './PasswordReset';

const ProfileSettings = () => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    display_name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        display_name: userProfile.display_name || '',
        address: userProfile.address||'',
        city: userProfile.city||'',
        state: userProfile.state||'',
        zipCode: userProfile.zip_code||'',
        country: 'India',
      });
      
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          display_name: formData.display_name,
           address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (showPasswordReset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => setShowPasswordReset(false)}
          className="mb-4"
        >
          ← Back to Profile
        </Button>
        <PasswordReset />
      </div>
    );
  }

  return (
    <div className="w-full rounded-none  ">
      <Card className='border-none'>

        <CardContent className="p-1 border-none rounded-none text-sm">
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input

                
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="mb-1">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Enter your display name"
              />
            </div>
           {/* 
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter your ZIP code"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  className="cursor-not-allowed bg-gray-800"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter your country"
                />
              </div>
            </div>*/}

            <div className="mb-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={currentUser?.email || ''}
                disabled
                className="bg-gray-800 font-medium"
              />
              <p className="text-sm font-medium text-white mt-2  mb-5">
                Email cannot be changed
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full font-semibold rounded-none">
              {loading && <Loader2 className="mr-2   h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

     {/* <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordReset(true)}
                className="w-full"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      */}
    </div>
  );
};

export default ProfileSettings;
