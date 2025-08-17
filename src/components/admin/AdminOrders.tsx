
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminOrders: React.FC = () => {
  const handleExportOrders = () => {
    console.log('Export functionality will be available once database is set up');
  };

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Orders Management</h2>
          <Button variant="outline" onClick={handleExportOrders}>
            Export Orders
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Orders management functionality will be available once the database tables are set up.
              </p>
              <p className="text-sm text-gray-500">
                You'll need to create the orders, profiles, and other necessary tables in your Supabase database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
