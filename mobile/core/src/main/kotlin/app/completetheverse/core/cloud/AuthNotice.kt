package app.completetheverse.core.cloud

object AuthNotice {
    fun notice(reason: String?): String {
        return when (reason) {
            "offline" -> "You're offline. Try again when you reconnect."
            "invalid-email" -> "Enter a valid email address."
            "rate-limited" -> "Too many attempts. Wait a few minutes."
            "not-configured" -> "Cloud is not available on this build."
            "unavailable" -> "Could not send the link. Try again."
            "signed-out" -> "Sign in to post scores."
            "name-too-short" -> "Name needs at least two letters."
            "trusted-submit-unavailable" -> "Trusted leaderboard submission is unavailable."
            "otp-expired", "link-expired" ->
                "Email code or link expired / pre-scanned. Enter the 6-digit code from your email or request a new one."
            "invalid-token" -> "Invalid 6-digit code. Check your email."
            "missing-token" -> "Enter the 6-digit code from your email."
            "verified" -> "Signed in successfully."
            else -> "Check your email for the sign-in link."
        }
    }
}
