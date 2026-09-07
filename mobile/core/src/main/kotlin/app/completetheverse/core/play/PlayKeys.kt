package app.completetheverse.core.play

object PlayKeys {
    const val DOUBLE_TAP_MS = 420L

    fun choiceIndex(key: String): Int? {
        val k = key.lowercase()
        if (k.length == 1 && k[0] in '1'..'9') return k[0] - '1'
        val letter = "abcdefghi".indexOf(k)
        return if (letter >= 0) letter else null
    }

    fun isConfirm(key: String): Boolean {
        val k = key.lowercase()
        return k == "enter" || k == " " || k == "space"
    }

    fun isEscape(key: String): Boolean = key.lowercase() == "escape"

    fun playKeyEvent(
        event: String,
        choiceCount: Int,
        selectedIndex: Int?,
        onSelect: (Int) -> Unit,
        onConfirm: () -> Unit,
        onEscape: () -> Unit,
    ): Boolean {
        if (isEscape(event)) {
            onEscape()
            return true
        }
        if (isConfirm(event)) {
            if (selectedIndex != null && selectedIndex in 0 until choiceCount) {
                onConfirm()
                return true
            }
            return false
        }
        val idx = choiceIndex(event) ?: return false
        if (idx !in 0 until choiceCount) return false
        onSelect(idx)
        return true
    }

    fun isFadeDone(key: String): Boolean = key.lowercase() == "d"

    fun hallModeIndex(key: String): Int? {
        if (key.length != 1 || key[0] !in '1'..'9') return null
        return key[0] - '1'
    }

    fun shouldConfirmRepeat(
        pickKey: String,
        lastPickKey: String?,
        lastPickAtMs: Long,
        nowMs: Long,
        hasSelection: Boolean,
    ): Boolean = hasSelection && pickKey == lastPickKey && nowMs - lastPickAtMs < DOUBLE_TAP_MS
}
