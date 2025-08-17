
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, Gift, Shield, History } from 'lucide-react';
import ProfileSettings from './ProfileSettings';
import PasswordReset from './PasswordReset';
import RewardsSection from './RewardsSection';
import OrderHistory from './OrderHistory';
import AccountSettings from './AccountSettings';
import ResetPassword from '../../pages/ResetPassword'

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="w-full max-w-4xl ">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-10 bg-gray-800 rounded-xl p-1 ">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 text-sm px-1 py-2 font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
         {/* <TabsTrigger
            value="settings"
            className="flex items-center gap-2 text-sm px-1 py-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
           >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger> */}
          <TabsTrigger
            value="security"
           className="flex items-center gap-2 text-sm px-1 py-2 font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Shield size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
           className="flex items-center gap-2 text-sm px-1 py-2  font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Gift size={16} />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-gray-800">
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AccountSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-gray-800">
              <PasswordReset />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift size={20} />
                Rewards & Points
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-gray-800">
              <RewardsSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={20} />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
