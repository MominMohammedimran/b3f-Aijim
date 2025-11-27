import { supabase } from "@/integrations/supabase/client";

export async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*");

  if (error) throw new Error(error.message);

  return data;
}
