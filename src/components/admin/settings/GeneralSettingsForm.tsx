
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneralSettings {
  site_name: string;
  maintenance_mode: boolean;
  delivery_fee: number;
  min_order_amount: number;
}

const GeneralSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<GeneralSettings>({
    site_name: 'AIJIM',
    maintenance_mode: false,
    delivery_fee: 80,
    min_order_amount: 100
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_settings');
      
      if (error) throw error;
      
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_admin_settings', {
        p_site_name: settings.site_name,
        p_site_description: 'Custom printing services',
        p_contact_email: 'contact@aijim.com',
        p_contact_phone: '+91 9999999999',
        p_business_address: 'India',
        p_delivery_fee: settings.delivery_fee,
        p_min_order_amount: settings.min_order_amount
      });
      
      if (error) throw error;
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof GeneralSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            value={settings.site_name}
            onChange={(e) => handleInputChange('site_name', e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="maintenance_mode"
            checked={settings.maintenance_mode}
            onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
          />
          <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
        </div>

        <div>
          <Label htmlFor="delivery_fee">Delivery Fee (₹)</Label>
          <Input
            id="delivery_fee"
            type="number"
            value={settings.delivery_fee}
            onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
          <Input
            id="min_order_amount"
            type="number"
            value={settings.min_order_amount}
            onChange={(e) => handleInputChange('min_order_amount', parseFloat(e.target.value) || 0)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsForm;
