
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminOrderView = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Orders">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/orders')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Database Setup Required</h2>
            <p className="text-gray-600">
              Order management functionality will be available once the database tables are set up.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderView;
