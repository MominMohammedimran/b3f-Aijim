import React from 'react';
import AdminArticleEditor from '@/components/admin/article/AdminArticleEditor';
import ModernAdminLayout from "../../components/admin/ModernAdminLayout";
const AdminArticleEdit: React.FC = () => {
  return <ModernAdminLayout title="Users"><AdminArticleEditor /></ModernAdminLayout>;
};

export default AdminArticleEdit;