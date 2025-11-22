import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

import { AuthForm } from "../components/auth/AuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SignIn = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();

  /** Listen to global tab switch event */
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail === "signin" || e.detail === "signup") {
        setActiveTab(e.detail);
      }
    };

    window.addEventListener("switch-tab", handler);
    return () => window.removeEventListener("switch-tab", handler);
  }, []);

  /** Pre-select tab from ?tab=signup */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup" || tab === "signin") {
      setActiveTab(tab);
    }
  }, [location]);

  /** Redirect if logged in */
  useEffect(() => {
    if (currentUser && !loading) {
      const redirectTo = new URLSearchParams(location.search).get("redirectTo");
      setTimeout(() => {
        navigate(redirectTo || "/");
        toast.success("Successfully signed in!");
      }, 100);
    }
  }, [currentUser, loading]);

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "Sign In | AIJIM",
          description: "Access your AIJIM account.",
        }}
      />

      <div className="container mx-auto h-auto flex items-center justify-center mt-12 pt-12">
        <div className="w-full max-w-lg bg-black">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "signin" | "signup")
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full bg-gray-900 bg-black rounded-none border border-gray-200">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>

              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            <div className="bg-gray-900 rounded-none shadow-lg p-6 mt-3">
              <TabsContent value="signin">
                <AuthForm initialMode="signin" redirectTo="/" />
              </TabsContent>

              <TabsContent value="signup">
                <AuthForm initialMode="signup" redirectTo="/" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
