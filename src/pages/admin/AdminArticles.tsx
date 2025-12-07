import React from 'react';
import AdminArticlesList from '@/components/admin/article/AdminArticlesList';
import ModernAdminLayout from "../../components/admin/ModernAdminLayout";


const AdminArticles: React.FC = () => {
  
  return <ModernAdminLayout title="Users"> <AdminArticlesList /> </ModernAdminLayout>;
};

export default AdminArticles;