package app.completetheverse.ui.intro

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.R
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import kotlinx.coroutines.delay

private val BOOT_MSGS = listOf(
    "Opening the sacred record…",
    "Gathering the witnesses…",
    "Preparing the trial…",
    "Lighting the final lamp…",
    "The record is open.",
)

@Composable
fun BootSplash(modifier: Modifier = Modifier) {
    IntroFrame(modifier) {
        Kick("The Scripture Trial · Preparing the record")
        Text(
            text = "Opening the sacred record…",
            modifier = Modifier.padding(top = 22.dp),
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontSize = 16.sp,
            textAlign = TextAlign.Center,
        )
        Text(
            text = "66 Books · One final answer",
            modifier = Modifier.padding(top = 18.dp),
            color = CtvColors.goldDim,
            fontFamily = CtvFonts.ui,
            fontSize = 12.sp,
            letterSpacing = 0.12.em,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.weight(1f))
    }
}

@Composable
fun IntroScreen(
    onFinished: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var booting by rememberSaveable { mutableStateOf(false) }
    var fast by rememberSaveable { mutableStateOf(false) }
    var bootIndex by rememberSaveable { mutableIntStateOf(0) }
    var completed by remember { mutableStateOf(false) }

    fun beginBoot(fromSkip: Boolean) {
        if (fromSkip) fast = true
        booting = true
    }

    BackHandler { beginBoot(fromSkip = true) }

    LaunchedEffect(booting, fast) {
        if (!booting || completed) return@LaunchedEffect
        val step = if (fast) 160L else 380L
        val last = if (fast) 220L else 420L
        for (i in BOOT_MSGS.indices) {
            bootIndex = i
            delay(if (i == BOOT_MSGS.lastIndex) last else step)
        }
        if (!completed) {
            completed = true
            onFinished()
        }
    }

    IntroFrame(
        modifier = modifier.then(
            if (!booting) {
                Modifier.clickable(role = Role.Button) { beginBoot(fromSkip = false) }
            } else {
                Modifier
            },
        ),
    ) {
        Kick(
            if (booting) "The Scripture Trial · Preparing the record"
            else "The Scripture Trial",
        )
        if (booting) {
            Text(
                text = "The word of God is quick, and powerful, and sharper than any twoedged sword.",
                modifier = Modifier
                    .widthIn(max = 480.dp)
                    .padding(top = 16.dp),
                color = CtvColors.parch,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 18.sp,
                lineHeight = 26.sp,
                textAlign = TextAlign.Center,
            )
            Text(
                text = "Hebrews 4:12 · King James",
                modifier = Modifier.padding(top = 8.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
                textAlign = TextAlign.Center,
            )
            Text(
                text = BOOT_MSGS[bootIndex.coerceIn(BOOT_MSGS.indices)],
                modifier = Modifier.padding(top = 22.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 16.sp,
                textAlign = TextAlign.Center,
            )
            Text(
                text = "66 Books · One final answer",
                modifier = Modifier.padding(top = 18.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
                textAlign = TextAlign.Center,
            )
        } else {
            Text(
                text = "Tap to begin",
                modifier = Modifier.padding(top = 16.dp),
                color = CtvColors.goldHot,
                fontFamily = CtvFonts.ui,
                fontSize = 14.sp,
                letterSpacing = 0.18.em,
                textAlign = TextAlign.Center,
            )
        }
        Spacer(Modifier.weight(1f))
        GhostButton("Skip", onClick = { beginBoot(fromSkip = true) })
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun IntroFrame(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit,
) {
    Box(modifier.fillMaxSize()) {
        Image(
            painter = painterResource(R.drawable.intro),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0x9904040A),
                            Color(0x6604040A),
                            Color(0xE604040A),
                        ),
                    ),
                ),
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            content = {
                Spacer(Modifier.weight(1f))
                Image(
                    painter = painterResource(R.drawable.logo),
                    contentDescription = "Complete the Verse",
                    contentScale = ContentScale.Fit,
                    modifier = Modifier
                        .fillMaxWidth(0.62f)
                        .widthIn(max = 280.dp),
                )
                Spacer(Modifier.height(12.dp))
                content()
            },
        )
    }
}
