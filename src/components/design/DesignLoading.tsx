import React from 'react';
import Layout from '@/components/layout/Layout';

const DesignLoading: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container-custom px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DesignLoading;
