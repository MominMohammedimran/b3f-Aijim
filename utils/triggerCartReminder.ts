export async function triggerCartReminder() {
  try {
    const response = await fetch(
      "https://zfdsrtwjxwzwbrtfgypm.functions.supabase.co/send-cart-reminders",
      {
        method: "POST", // Edge Function can accept POST or GET
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trigger: true }), // optional payload
      }
    );

    const text = await response.text();
  } catch (err) {
    console.error("Error triggering Edge Function:", err);
  }
}
