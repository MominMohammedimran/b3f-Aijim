
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminProducts = () => {
  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Products management functionality will be available once the database tables are set up.
              </p>
              <p className="text-sm text-gray-500">
                You'll need to create the products table in your Supabase database.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
