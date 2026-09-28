package app.completetheverse.ui.edition

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun EditionPickScreen(
    onPick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 24.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            GoldHeadline("Choose your translation")
            Spacer(Modifier.height(12.dp))
            Text(
                text = "One hall, two editions. Verse memory and Daily records stay with the edition you pick. The road, relics, and seals are shared.",
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 16.sp,
                lineHeight = 1.5.em,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 420.dp).fillMaxWidth(),
            )
            Spacer(Modifier.height(28.dp))
            GhostButton(
                text = "King James Version",
                onClick = { onPick("kjv") },
                modifier = Modifier.widthIn(max = 360.dp).fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Kick("KJV · 1611 tradition")
            Spacer(Modifier.height(20.dp))
            GhostButton(
                text = "New King James Version",
                onClick = { onPick("nkjv") },
                modifier = Modifier.widthIn(max = 360.dp).fillMaxWidth(),
            )
            Spacer(Modifier.height(8.dp))
            Kick("NKJV · modern English")
            Spacer(Modifier.height(28.dp))
            Text(
                text = "Scripture taken from the New King James Version®. Copyright © 1982 by Thomas Nelson. Used by permission. All rights reserved.",
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 12.sp,
                lineHeight = 1.4.em,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 420.dp).fillMaxWidth(),
            )
        }
    }
}
