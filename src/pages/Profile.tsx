
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import ProfileTabs from '../components/profile/ProfileTabs';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import SEOHelmet from '../components/seo/SEOHelmet';

const Profile = () => {
  const {userProfile, currentUser } = useAuth();
  

  const seoData = {
    title: 'My Profile - AIJIM',
    description: 'Manage your AIJIM account profile, settings, rewards, and order history.',
    keywords: 'profile, account settings, rewards, order history, AIJIM'
  };

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center mb-6 mt-4 pt-6">
          <Link to="/" className="mr-4 p-2 hover:text-gray-200 transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
        </div>
        
        {currentUser ? (
          <div className="space-y-2">
            <UserProfileHeader 
             name={userProfile?.display_name || 'User'}
email={userProfile?.email || 'No email'}
createdAt={
  userProfile?.created_at||''}
            />
            <ProfileTabs />
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">Sign In Required</h2>
            <p className="text-amber-700 mb-4">Please sign in to view your profile information.</p>
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
