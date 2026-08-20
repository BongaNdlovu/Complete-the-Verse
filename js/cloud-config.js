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
  /* Project ref fgwfniblkuozxlbgytfk — dashboard:
     https://supabase.com/dashboard/project/fgwfniblkuozxlbgytfk */
  url: "https://fgwfniblkuozxlbgytfk.supabase.co",
  anonKey: "sb_publishable_HCTg_41unUkwNVZwrSIEYg_8QDo4Fu0"
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CLOUD_CONFIG;
}
