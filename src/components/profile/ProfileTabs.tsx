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
    <div className="w-full max-w-4xl text-white">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full m-auto grid-cols-5 mb-10 bg-gray-800 rounded-3xl p-1">
          <TabsTrigger
            value="rewards"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Gift size={16} />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Shield size={16} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>

          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>

          <TabsTrigger
            value="addresses"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <MapPin size={16} />
            <span className="hidden sm:inline">Addresses</span>
          </TabsTrigger>

          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 text-sm px-1 py-2 font-semibold rounded-3xl transition-all data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-md"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
              <CardTitle className="flex items-center gap-2">
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
              <CardTitle className="flex items-center gap-2">
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
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                My Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;