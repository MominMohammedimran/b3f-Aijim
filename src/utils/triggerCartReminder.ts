import { supabase } from "@/integrations/supabase/client";

export async function triggerCartReminder(cartId?: string) {
  try {
    // Call your Edge Function
    const { data, error } = await supabase.functions.invoke(
      "send-cart-reminders",
      {
        method: "POST",
        body: JSON.stringify({ cartId }), // optional: pass cartId
      }
    );

    if (error) throw error;

    console.log("Edge function response:", data);
  } catch (err) {
    console.error("Error triggering Edge Function:", err);
  }
}
