// supabase/functions/mark-no-shows/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get Supabase secrets from environment
const supabaseUrl = Deno.env.get("PROJECT_URL") ?? "";
const supabaseKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async () => {
  const now = new Date();

  // Get all confirmed bookings that haven't been checked in
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      check_in_time,
      slot:slot_id (slot_date, slot_time)
    `)
    .eq("status", "confirmed")
    .is("check_in_time", null);

  if (error) {
    console.error("Error fetching bookings:", error);
    return new Response("Error fetching bookings", { status: 500 });
  }

  const noShows = bookings.filter((booking) => {
    const slotDateTime = new Date(`${booking.slot.slot_date}T${booking.slot.slot_time}`);
    return slotDateTime < now;
  });

  for (const booking of noShows) {
    await supabase
      .from("bookings")
      .update({ status: "no_show", no_show: true })
      .eq("id", booking.id);
  }

  return new Response(`Marked ${noShows.length} no-show(s)`, { status: 200 });
});
