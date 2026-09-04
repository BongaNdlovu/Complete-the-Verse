package app.completetheverse.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import app.completetheverse.R

object CtvFonts {
    val display = FontFamily(
        Font(R.font.cinzel_semibold, FontWeight.SemiBold),
        Font(R.font.cinzel_bold, FontWeight.Bold),
        Font(R.font.cinzel_bold, FontWeight.ExtraBold),
        Font(R.font.cinzel_black, FontWeight.Black),
        Font(R.font.cinzel_semibold, FontWeight.Normal),
    )

    val body = FontFamily(
        Font(R.font.eb_garamond_regular, FontWeight.Normal),
        Font(R.font.eb_garamond_medium, FontWeight.Medium),
        Font(R.font.eb_garamond_medium, FontWeight.SemiBold),
        Font(R.font.eb_garamond_italic, FontWeight.Normal, FontStyle.Italic),
    )

    val ui = FontFamily(
        Font(R.font.barlow_condensed_regular, FontWeight.Normal),
        Font(R.font.barlow_condensed_semibold, FontWeight.SemiBold),
        Font(R.font.barlow_condensed_semibold, FontWeight.Bold),
    )
}

val CtvTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.Black,
        fontSize = 44.sp,
        color = CtvColors.goldHot,
    ),
    displayMedium = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        color = CtvColors.goldHot,
    ),
    displaySmall = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        color = CtvColors.gold,
    ),
    headlineLarge = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        color = CtvColors.gold,
    ),
    headlineMedium = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = 18.sp,
        color = CtvColors.goldHot,
    ),
    headlineSmall = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        color = CtvColors.gold,
    ),
    titleLarge = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        color = CtvColors.goldHot,
    ),
    titleMedium = TextStyle(
        fontFamily = CtvFonts.display,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        color = CtvColors.goldHot,
    ),
    titleSmall = TextStyle(
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        color = CtvColors.goldDim,
    ),
    bodyLarge = TextStyle(
        fontFamily = CtvFonts.body,
        fontWeight = FontWeight.Normal,
        fontSize = 18.sp,
        color = CtvColors.parch,
    ),
    bodyMedium = TextStyle(
        fontFamily = CtvFonts.body,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        color = CtvColors.parchDim,
    ),
    bodySmall = TextStyle(
        fontFamily = CtvFonts.body,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        color = CtvColors.parchDim,
    ),
    labelLarge = TextStyle(
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        color = CtvColors.gold,
    ),
    labelMedium = TextStyle(
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        color = CtvColors.goldDim,
    ),
    labelSmall = TextStyle(
        fontFamily = CtvFonts.ui,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        color = CtvColors.goldDim,
    ),
)
