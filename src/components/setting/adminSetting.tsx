import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSettings = () => {
  const { settings, loading, error } = useSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {settings ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Site Name:</h3>
              <p>{settings.site_name || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Site Description:</h3>
              <p>{settings.site_description || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Contact Phone:</h3>
              <p>{settings.contact_phone || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Contact Email:</h3>
              <p>{settings.contact_email || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Business Address:</h3>
              <p>{settings.business_address || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Delivery Fee:</h3>
              <p>{settings.delivery_fee ?? 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Minimum Order Amount:</h3>
              <p>{settings.min_order_amount ?? 'Not set'}</p>
            </div>
          </div>
        ) : (
          <p>No settings found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSettings;

