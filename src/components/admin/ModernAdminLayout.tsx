import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  Home,
  LogOut,
  Bell,
  Search,
  CreditCard,
  Newspaper,
  ImageIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import AdminBottomNavigation from './AdminBottomNavigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ModernAdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

const ModernAdminLayout: React.FC<ModernAdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actionButton,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ordersNum, setOrdersNum] = useState(0);
  const { currentUser, signOut } = useAuth();
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  // Fetch number of pending orders
  useEffect(() => {
    fetchOrderCount();
  }, []);

  const fetchOrderCount = async () => {
    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setOrdersNum(count || 0);
    } catch {
      toast.error('Unable to fetch order count');
      setOrdersNum(0);
    }
  };

  // Logout current device
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/admin/login');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  // Logout from all devices (via Edge Function)
 const handleLogoutAllDevices = async () => {
 try {
    if (!currentUser) throw new Error("No current user");

    const { data, error } = await supabase.functions.invoke("logout-all", {
      body: { userId: currentUser.id },
    });

    if (error) throw error;

    toast.success("Logged out from all devices successfully");
    navigate("/admin/login");
  } catch (err) {
    console.error(err);
    toast.error("Failed to log out from all devices");
  }
};





  const redirectToOrders = () => navigate('/admin/orders');

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', path: '/admin', exact: true },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Users, label: 'Users', path: '/admin/profiles' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: CreditCard, label: 'Payments', path: '/admin/order-manager' },
    { icon: Newspaper, label: 'Articles', path: '/admin/articles' },
    { icon: ImageIcon, label: 'Banner', path: '/admin/banners' },
    

  ];

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="text-xl font-bold text-white">Aijim Admin</h2>
        <p className="text-sm text-blue-100 mt-1">Management Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <Icon size={20} className={active ? 'text-blue-600' : 'group-hover:text-blue-600'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-gray-50 space-y-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </Button>

      {/*  <Button
          variant="ghost"
          onClick={() => setConfirmLogoutAll(true)}
          className="w-full justify-start text-red-600 hover:text-red-700"
        >
          <LogOut size={20} className="mr-3" />
          Logout from all devices
        </Button>*/}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-800 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-xl rounded-r-2xl">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-800 border border-gray-800 hover:bg-gray-400 hover:text-white"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>

        <div className="flex items-center gap-3">
          <Button
            onClick={redirectToOrders}
            variant="ghost"
            size="icon"
            className="relative hover:bg-yellow-400"
          >
            <Bell className="text-gray-800" size={20} />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {ordersNum}
            </Badge>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-600"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="hidden md:block bg-white shadow-sm border-b px-2 py-4 rounded-b-2xl mx-1 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>

                {actionButton}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-1  bg-gray-800">
            <Card className="shadow-lg border-0 bg-gray-800 backdrop-blur-sm">
              <CardContent className="p-1">{children}</CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <AdminBottomNavigation />

      {/* Logout All Devices Confirmation Modal 
      {confirmLogoutAll && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Confirm Logout</h2>
            <p className="mb-6 text-black">
              Are you sure you want to log out from all devices?
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setConfirmLogoutAll(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleLogoutAllDevices();
                  setConfirmLogoutAll(false);
                }}
              >
                Logout All
              </Button>
            </div>
          </div>
        </div>
      )}*/}
    </div>
  );
};

export default ModernAdminLayout;

