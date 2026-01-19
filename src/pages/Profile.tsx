import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import ProfileTabs from "../components/profile/ProfileTabs";
import UserProfileHeader from "../components/profile/UserProfileHeader";
import SEOHelmet from "../components/seo/SEOHelmet";
import Feedback from "./legal/Feedback";

const Profile = () => {
  const { userProfile, currentUser } = useAuth();

  const seoData = {
    title: "My Profile - AIJIM",
    description:
      "Manage your AIJIM account profile, settings, rewards, and order history.",
    keywords: "profile, account settings, rewards, order history, AIJIM",
  };

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
       <nav className="flex items-center gap-2 mt-10 mb-5 text-white text-sm sm:text-base">
                                       <Link to="/" className="opacity-70 hover:opacity-100 transition">
                                         Home
                                       </Link>
                                   
                                      <span className="opacity-60">/</span>
                                    
                                   
                                       <span className="font-semibold line-clamp-1">
                                      
                                       Profile
                                       </span>
                                     </nav>

        {currentUser ? (
          <div className="space-y-4">
            <UserProfileHeader
              name={userProfile?.display_name || "User"}
              email={userProfile?.email || "No email"}
              createdAt={userProfile?.created_at || ""}
            />
            <ProfileTabs />
            <Feedback mode='inline'/>
          </div>
        ) : (
          <div className="bg-gray-900 border border-amber-200 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-white mb-4">
              Please sign in to view your profile information.
            </p>
            <Link
              to="/signin"
              className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
