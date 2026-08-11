/* ==================================================================
   CLOUD CONFIG — Supabase project keys for Complete the Verse.

   Org: https://supabase.com/dashboard/org/ceftinnoxfczhbrcfjzq

   1. Create a project in that org (if you do not have one yet).
   2. Project Settings → API → copy Project URL and anon public key.
   3. Paste them below (anon key is safe in the browser; RLS protects data).
   4. Run supabase/migrations/001_complete_the_verse.sql in the SQL Editor.
   5. Auth → Providers → enable Email (magic link) and/or Google.

   Leave both empty to keep the game fully offline (guest / local only).
   ================================================================== */

var CLOUD_CONFIG = {
  /* Project ref eanjhcktflbpbjkdjtej — dashboard:
     https://supabase.com/dashboard/project/eanjhcktflbpbjkdjtej */
  url: "https://eanjhcktflbpbjkdjtej.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbmpoY2t0ZmxicGJqa2RqdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTc2NjUsImV4cCI6MjEwMjAzMzY2NX0.GExfRAn-wPI0glZymuEF0FliKCF1u7ubsTWM_QCNSbY"
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CLOUD_CONFIG;
}
