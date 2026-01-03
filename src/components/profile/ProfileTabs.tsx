import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  Settings,
  Gift,
  Shield,
  MapPin,
  Bell,
  History,
} from "lucide-react";
import ProfileSettings from "./ProfileSettings";
import PasswordReset from "./PasswordReset";
import RewardsSection from "./RewardsSection";
import AccountSettings from "./AccountSettings";
import AddressManagement from "./AddressManagement";
import NotificationSettings from "./NotificationSettings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState("rewards");

  return (
    <div className="w-full w-full text-white rounded-3xl">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full rounded-3xl "
      >
        <TabsList className="grid w-full h-auto m-auto grid-cols-4 mb-10 bg-gray-800 rounded-3xl">
          <TabsTrigger
  value="rewards"
  className="flex  sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 font-semibold rounded-3xl transition-all 
  data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
>
  <Gift size={14} />
  <span className="text-[10px] sm:text-[12px]">Rewards</span>
</TabsTrigger>

<TabsTrigger
  value="security"
  className="flex  sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 font-semibold rounded-3xl transition-all 
  data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
>
  <Shield size={14} />
  <span className="text-[10px] sm:text-[12px]">Password</span>
</TabsTrigger>

<TabsTrigger
  value="profile"
  className="flex  sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 font-semibold rounded-3xl transition-all 
  data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
>
  <User size={14} />
  <span className="text-[10px] sm:text-[12px]">Name</span>
</TabsTrigger>

<TabsTrigger
  value="addresses"
  className="flex  sm:flex-row items-center sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 font-semibold rounded-3xl transition-all 
  data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
>
  <MapPin size={16} />
  <span className="text-[10px] sm:text-[12px]">Address</span>
</TabsTrigger>


         {/* <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>*/}
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift size={20} />
                Rewards & Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RewardsSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield size={20} />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordReset />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg leading-relaxed tracking-relaxed">
                <User size={20} />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin size={20} />
                My Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab 
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>*/}
      </Tabs>
    </div>
  );
};

export default ProfileTabs;