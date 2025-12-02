import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PasswordReset from "./PasswordReset";

const ProfileSettings = () => {
  const { userProfile, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    display_name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  // Load profile data into form
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone: userProfile.phone || "",
        display_name: userProfile.display_name || "",
        address: userProfile.address || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        zipCode: userProfile.zip_code || "",
        country: "India",
      });
    }
  }, [userProfile]);

  // ---------------- HANDLE SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);

    try {
      // Clean & auto-generate display name
      let newDisplayName = formData.display_name.trim();
      if (!newDisplayName) {
        newDisplayName = currentUser.email.split("@")[0];
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          display_name: formData.display_name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      // Instead of immediately refreshing the form, show a toast/popup
      toast.custom((t) => (
        <div className="max-w-sm w-full bg-gray-900 border border-yellow-400 text-white p-4 rounded shadow-lg justify-between items-center gap-4">
          <span>Profile updated! Refresh to see changes.</span>
          <div className=" gap-8 flex items-center justify-between mt-2">
            <button
              className="bg-yellow-400 text-black px-3 py-1 rounded font-semibold text-sm hover:bg-yellow-300 transition"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
            <button
              className="text-gray-200 font-bold text-lg"
              onClick={() => toast.dismiss(String(t))}
            >
              ✕
            </button>
          </div>
        </div>
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------- PASSWORD RESET SCREEN ----------------
  if (showPasswordReset) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => setShowPasswordReset(false)}
          className="mb-4"
        >
          ← Back to Profile
        </Button>
        <PasswordReset />
      </div>
    );
  }

  // ---------------- MAIN PROFILE UI ----------------
  return (
    <div className="w-full rounded-none">
      <Card className="border-none">
        <CardContent className="p-1 border-none rounded-none text-sm">
          <form onSubmit={handleSubmit} className="space-y-0">
            {/* DISPLAY NAME */}
            <div className="mb-1">
              <Label htmlFor="display_name" className="text-sm">
                Display Name
              </Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                placeholder="Enter your display name"
                className="text-sm"
              />
            </div>

            {/* EMAIL */}
            <div className="mb-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                value={currentUser?.email || ""}
                disabled
                className="bg-gray-800 text-sm font-medium"
              />
              <p className="text-sm font-semimedium text-white mt-2 mb-5">
                Email cannot be changed
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-none"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
