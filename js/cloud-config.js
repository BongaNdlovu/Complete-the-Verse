/* ==================================================================
   CLOUD CONFIG — Supabase project keys for Complete the Verse.

   Org: https://supabase.com/dashboard/org/ceftinnoxfczhbrcfjzq

   1. Create a project in that org (if you do not have one yet).
   2. Project Settings → API → copy Project URL and anon public key.
   3. Paste them below (anon key is safe in the browser; RLS protects data).
   4. Run supabase/migrations/001_complete_the_verse.sql in the SQL Editor.
   5. Auth → Providers → enable Email (OTP) and Google.
   6. Auth → URL configuration: https://complete-the-verse.vercel.app/**
      and completetheverse://**
   7. Google Cloud OAuth client: add the Android package
      app.completetheverse.twa and SHA-256
      85ebf6937d2374307fc1e82464617cce69daa090b862163af7627166a511deaf

   Empty keys keep file:// guest play. http(s) builds with keys require
   a session before Hall.
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
