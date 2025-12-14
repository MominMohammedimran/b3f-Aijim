import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, Gift, Shield, History, MapPin, ShoppingBag, Heart, Wallet } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import PasswordReset from './PasswordReset';
import RewardsSection from './RewardsSection';
import OrderHistory from './OrderHistory';
import AccountSettings from './AccountSettings';
import AddressManagement from './AddressManagement';

const ProfileTabsNew = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'ORDERS', icon: ShoppingBag },
    { id: 'wishlist', label: 'WISHLIST', icon: Heart },
    { id: 'wallet', label: 'WALLET', icon: Wallet },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation Tabs */}
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-card rounded-lg p-2 border-2 border-border">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-3 text-sm px-4 py-3 font-bold uppercase tracking-wider rounded-lg transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow hover:bg-secondary"
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-8">
          <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                <ShoppingBag size={24} className="text-primary" />
                ORDER HISTORY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <OrderHistory />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="mt-8">
          <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                <Heart size={24} className="text-primary" />
                MY WISHLIST
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 space-y-4">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-bold uppercase tracking-wider">NO ITEMS IN WISHLIST</h3>
                <p className="text-muted-foreground">Start adding your favorite streetwear pieces!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="mt-8">
          <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                <Wallet size={24} className="text-primary" />
                MY WALLET
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RewardsSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-8">
          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                  <User size={24} className="text-primary" />
                  PROFILE INFORMATION
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileSettings />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                  <Shield size={24} className="text-primary" />
                  SECURITY SETTINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PasswordReset />
              </CardContent>
            </Card>

            {/* Address Management */}
            <Card className="bg-card border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider">
                  <MapPin size={24} className="text-primary" />
                  MY ADDRESSES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AddressManagement />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabsNew;