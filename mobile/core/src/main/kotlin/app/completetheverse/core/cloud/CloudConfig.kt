package app.completetheverse.core.cloud

/** Same Supabase project as js/cloud-config.js. */
object CloudConfig {
    const val URL = "https://fgwfniblkuozxlbgytfk.supabase.co"
    const val ANON_KEY = "sb_publishable_HCTg_41unUkwNVZwrSIEYg_8QDo4Fu0"

    fun isConfigured(): Boolean = URL.startsWith("http") && ANON_KEY.isNotEmpty()
}
