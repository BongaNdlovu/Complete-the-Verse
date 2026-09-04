package app.completetheverse.ui.profile

import app.completetheverse.R

object ScholarArt {
    fun portrait(id: String): Int = when (id) {
        "elias" -> R.drawable.char_elias_portrait
        "soojin" -> R.drawable.char_soojin_portrait
        "yusef" -> R.drawable.char_yusef_portrait
        "lucia" -> R.drawable.char_lucia_portrait
        "priya" -> R.drawable.char_priya_portrait
        "thomas" -> R.drawable.char_thomas_portrait
        "dawit" -> R.drawable.char_dawit_portrait
        else -> R.drawable.char_amina_portrait
    }

    fun token(id: String): Int = when (id) {
        "elias" -> R.drawable.char_elias_token
        "soojin" -> R.drawable.char_soojin_token
        "yusef" -> R.drawable.char_yusef_token
        "lucia" -> R.drawable.char_lucia_token
        "priya" -> R.drawable.char_priya_token
        "thomas" -> R.drawable.char_thomas_token
        "dawit" -> R.drawable.char_dawit_token
        else -> R.drawable.char_amina_token
    }
}
