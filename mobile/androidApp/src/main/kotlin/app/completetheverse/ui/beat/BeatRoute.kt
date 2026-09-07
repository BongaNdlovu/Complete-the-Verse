package app.completetheverse.ui.beat

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.completetheverse.core.beat.Beat
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun BeatRoute(
    incoming: Boolean = true,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Kick("A Beat of Faith")
            Spacer(Modifier.height(4.dp))
            GoldHeadline("The Valley")
            Filigree()
            Text(
                text = if (incoming) {
                    "The Valley waits. Same week the website ships Beat."
                } else {
                    "${Beat.questions.size} questions from 1 Samuel 17. Forty seconds each."
                },
                modifier = Modifier.widthIn(max = 520.dp).padding(top = 8.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.weight(1f))
            GhostButton("Hall", onClick = onBack)
            Spacer(Modifier.height(12.dp))
        }
    }
}
