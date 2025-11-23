import { useEffect } from "react";
import { saveDeviceToken } from "@/notifications/getDeviceToken";
import { useAuth } from "@/context/AuthContext";

export default function InitFCM() {
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.id) {
      saveDeviceToken(userProfile.id);
    }
  }, [userProfile]);

  return null;
}
