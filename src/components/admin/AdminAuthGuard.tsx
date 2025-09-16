
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          navigate('/admin/login');
          return;
        }

        // TODO: Implement admin check once database tables are created
        // For now, allow all authenticated users to access admin
    
        setIsAdmin(true);
        
      } catch (error: any) {
        console.error('Admin auth check error:', error);
        setError('Authentication failed');
        toast.error('Authentication error');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      checkAdminStatus();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying admin access</h2>
            <p className="text-gray-600 text-center">Please wait while we verify your credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold text-red-600">Authentication Error</h2>
            <p className="text-gray-600 text-center">{error}</p>
            <button 
              onClick={() => navigate('/admin/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return isAdmin ? <>{children}</> : null;
};

export default AdminAuthGuard;
