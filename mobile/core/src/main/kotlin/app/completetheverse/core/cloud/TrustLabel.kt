package app.completetheverse.core.cloud

object TrustLabel {
    fun label(via: String?): String {
        if (via.isNullOrEmpty()) return ""
        return if (via == "direct") "Honor system" else "Trusted"
    }
}
