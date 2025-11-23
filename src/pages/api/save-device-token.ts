import { supabase } from "@/integrations/supabase/client";

export default async function handler(req, res) {
  const { token, userId } = req.body;
  if (!token || !userId)
    return res.status(400).json({ error: "Missing token or userId" });

  const { error } = await supabase
    .from("profiles")
    .update({ device_token: token })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ success: true });
}
