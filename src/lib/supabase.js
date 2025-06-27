import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://nyjzqdpczzanlkejxqed.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55anpxZHBjenphbmxrZWp4cWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjYxMTMsImV4cCI6MjA2NjYwMjExM30.UCnG8K6IjTvk51Vflww3_PbpQpYhQdaw65UbTqzIgaM"

export const GOOGLE_MAPS_API_KEY = "AIzaSyDAY9tsXQublAc2y54vPqMy2bZuXYY6I5o"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
