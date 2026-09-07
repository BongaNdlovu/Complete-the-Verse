package app.completetheverse.core.cloud

object AppLinks {
    const val HOST = "complete-the-verse.vercel.app"
    const val ORIGIN = "https://$HOST"
    const val SCHEME = "completetheverse"

    fun isHttpsHost(host: String?): Boolean =
        host.equals(HOST, ignoreCase = true)

    fun isCustomScheme(scheme: String?): Boolean =
        scheme.equals(SCHEME, ignoreCase = true)

    fun isAppLink(scheme: String?, host: String?): Boolean =
        isHttpsHost(host) || isCustomScheme(scheme)

    fun looksLikeAuth(raw: String?): Boolean {
        if (raw.isNullOrBlank()) return false
        val lower = raw.lowercase()
        return lower.contains("access_token=") ||
            lower.contains("refresh_token=") ||
            lower.contains("token_hash=") ||
            (isCustomScheme(schemeOf(raw)) && lower.contains("token=")) ||
            (isHttpsHost(hostOf(raw)) && lower.contains("token="))
    }

    fun schemeOf(raw: String): String? {
        val colon = raw.indexOf("://")
        if (colon <= 0) return null
        return raw.substring(0, colon)
    }

    fun hostOf(raw: String): String? {
        val start = raw.indexOf("://")
        if (start < 0) return null
        val rest = raw.substring(start + 3)
        val end = rest.indexOfFirst { it == '/' || it == '?' || it == '#' || it == ':' }
        return if (end < 0) rest else rest.substring(0, end)
    }
}
