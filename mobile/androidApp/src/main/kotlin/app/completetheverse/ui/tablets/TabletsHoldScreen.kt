package app.completetheverse.ui.tablets

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.tablets.TabletBlank
import app.completetheverse.core.tablets.TabletChapter
import app.completetheverse.core.tablets.Tablets
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

private val LETTERS = listOf("A", "B", "C", "D")

@Composable
fun TabletsHoldScreen(
    chapter: TabletChapter,
    step: List<TabletBlank>,
    gapIdx: Int,
    remain: String,
    tabletIdx: Int,
    tabletTotal: Int,
    choices: List<String>,
    grey: List<String>,
    selected: String?,
    lastCorrect: Boolean?,
    resolving: Boolean,
    hinted: Boolean,
    illum: Int,
    winnowCharges: Int,
    lamps: Int,
    remainingMs: Long,
    durationMs: Long,
    untimed: Boolean,
    tutorial: Boolean,
    tutorialPrompt: String,
    favor: Int,
    streak: Int,
    paused: Boolean,
    confirmAbandon: Boolean,
    showPauseOverlay: Boolean = paused || confirmAbandon,
    reducedMotion: Boolean,
    skipHeavy: Boolean,
    flyTick: Int,
    shatterTick: Int,
    onPick: (String) -> Unit,
    onIlluminate: () -> Unit,
    onWinnow: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onAbandonRequest: () -> Unit,
    onStay: () -> Unit,
    onConfirmAbandon: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val denom = durationMs.coerceAtLeast(1L)
    val sec = ((remainingMs + 999) / 1000).coerceAtLeast(0)
    val crit = !untimed && sec <= 5 && !resolving && !paused
    val frac = if (untimed) 1f else (remainingMs.toFloat() / denom).coerceIn(0f, 1f)
    val fly by animateFloatAsState(
        targetValue = if (!skipHeavy && lastCorrect == true) 1f else 0f,
        animationSpec = tween(if (reducedMotion) 1 else 420),
        label = "carve-fly",
    )
    val fracture by animateFloatAsState(
        targetValue = if (!skipHeavy && lastCorrect == false) 1f else 0f,
        animationSpec = tween(if (reducedMotion) 1 else 280),
        label = "shatter",
    )
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            HoldHeader(
                chapter = chapter,
                tutorial = tutorial,
                remain = remain,
                remainingMs = remainingMs,
                crit = crit,
                frac = frac,
                untimed = untimed,
                lamps = lamps,
                favor = favor,
                streak = streak,
                onPause = onPause,
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(top = 14.dp, bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                if (tutorial && tutorialPrompt.isNotEmpty()) {
                    Text(
                        text = tutorialPrompt,
                        modifier = Modifier.widthIn(max = 520.dp).padding(bottom = 12.dp),
                        color = CtvColors.goldHot,
                        fontFamily = CtvFonts.body,
                        fontStyle = FontStyle.Italic,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
                    )
                }
                TabletCard(
                    chapter = chapter,
                    step = step,
                    gapIdx = gapIdx,
                    lastCorrect = lastCorrect,
                    selected = selected,
                    fly = fly,
                    fracture = fracture,
                    flyTick = flyTick,
                    shatterTick = shatterTick,
                )
                if (tabletTotal in 1..20 && chapter.blanks.size <= 20) {
                    Spacer(Modifier.height(10.dp))
                    StepPips(tabletIdx = tabletIdx, total = tabletTotal)
                }
                Spacer(Modifier.height(16.dp))
                val gapLabel = if (step.size > 1) {
                    "Word ${gapIdx + 1} of ${step.size} · Choose the missing word"
                } else {
                    "Choose the missing word"
                }
                Text(
                    text = gapLabel,
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontSize = 12.sp,
                    letterSpacing = 0.14.em,
                    modifier = Modifier.padding(bottom = 10.dp),
                )
                StoneGrid(
                    choices = choices,
                    grey = grey,
                    selected = selected,
                    answer = step.getOrNull(gapIdx)?.a.orEmpty(),
                    lastCorrect = lastCorrect,
                    hinted = hinted,
                    locked = resolving || paused,
                    onPick = onPick,
                )
                Spacer(Modifier.height(14.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                ) {
                    GhostButton(
                        text = "Illuminate ×$illum",
                        onClick = onIlluminate,
                        modifier = Modifier.weight(1f).alpha(if (illum < 1) 0.4f else 1f),
                    )
                    GhostButton(
                        text = "Winnow ×$winnowCharges",
                        onClick = onWinnow,
                        modifier = Modifier.weight(1f).alpha(if (winnowCharges < 1) 0.4f else 1f),
                    )
                }
            }
        }
        if (showPauseOverlay) {
            PauseOverlay(
                remain = remain,
                lamps = lamps,
                favor = favor,
                confirmAbandon = confirmAbandon,
                tutorial = tutorial,
                onResume = onResume,
                onAbandonRequest = onAbandonRequest,
                onStay = onStay,
                onConfirmAbandon = onConfirmAbandon,
            )
        }
    }
}

@Composable
private fun HoldHeader(
    chapter: TabletChapter,
    tutorial: Boolean,
    remain: String,
    remainingMs: Long,
    crit: Boolean,
    frac: Float,
    untimed: Boolean,
    lamps: Int,
    favor: Int,
    streak: Int,
    onPause: () -> Unit,
) {
    Column(Modifier.fillMaxWidth().widthIn(max = 720.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            GhostButton("Pause", onClick = onPause, small = true)
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text(
                    text = chapter.name.uppercase(),
                    color = CtvColors.gold,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    letterSpacing = 0.16.em,
                )
                Text(
                    text = (if (tutorial) "Learn the Hold" else "Pace ${Tablets.levelName(Tablets.paceOf(chapter))}") +
                        " · " + chapter.subtitle.ifEmpty { "KJV" },
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 13.sp,
                )
            }
            Column(horizontalAlignment = Alignment.End, modifier = Modifier.widthIn(min = 88.dp)) {
                Text(
                    text = if (untimed) "Untimed" else String.format("%.1fs", remainingMs.coerceAtLeast(0L) / 1000.0),
                    color = if (crit) CtvColors.bloodHot else CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                )
                Box(
                    Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .background(Color(0xB808090C)),
                ) {
                    Box(
                        Modifier
                            .fillMaxWidth(frac)
                            .height(4.dp)
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFFFFE8AE), CtvColors.gold, CtvColors.blood),
                                ),
                            ),
                    )
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = "Lamps ×$lamps",
                color = if (lamps <= 1) CtvColors.bloodHot else CtvColors.gold,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                letterSpacing = 0.14.em,
            )
            Text(
                text = remain,
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
            )
            Text(
                text = "Favor $favor  ·  $streak",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
            )
        }
    }
}

@Composable
private fun TabletCard(
    chapter: TabletChapter,
    step: List<TabletBlank>,
    gapIdx: Int,
    lastCorrect: Boolean?,
    selected: String?,
    fly: Float,
    fracture: Float,
    flyTick: Int,
    shatterTick: Int,
) {
    val unused = flyTick + shatterTick
    Box(
        modifier = Modifier
            .widthIn(max = 560.dp)
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(listOf(CtvColors.tabBg1, CtvColors.tabBg2, CtvColors.tabBg3)),
            )
            .border(2.dp, CtvColors.tabBorder)
            .padding(horizontal = 16.dp, vertical = 18.dp),
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text(
                text = (step.getOrNull(gapIdx)?.r ?: chapter.r).uppercase(),
                color = CtvColors.tabText.copy(alpha = 0.7f),
                fontFamily = CtvFonts.ui,
                fontSize = 11.sp,
                letterSpacing = 0.16.em,
            )
            Spacer(Modifier.height(10.dp))
            step.forEachIndexed { gi, blank ->
                val carved = if (lastCorrect == true) gi <= gapIdx else gi < gapIdx
                Text(
                    text = buildAnnotatedString {
                        withStyle(SpanStyle(color = CtvColors.tabText.copy(alpha = 0.55f), fontSize = 12.sp)) {
                            append(blank.r)
                            append("  ")
                        }
                        withStyle(SpanStyle(color = CtvColors.tabText)) { append(blank.prefix) }
                        append(" ")
                        if (carved) {
                            withStyle(SpanStyle(color = Color(0xFF3A2208), fontWeight = FontWeight.Bold)) {
                                append(blank.a)
                            }
                        } else {
                            withStyle(SpanStyle(color = CtvColors.tabText.copy(alpha = 0.45f))) { append("___") }
                        }
                        if (blank.suffix.isNotEmpty()) {
                            append(" ")
                            withStyle(SpanStyle(color = CtvColors.tabText)) { append(blank.suffix) }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    fontFamily = CtvFonts.body,
                    fontSize = 18.sp,
                    lineHeight = 24.sp,
                    textAlign = TextAlign.Center,
                )
            }
            Spacer(Modifier.height(14.dp))
            val slotWord = if (lastCorrect == true) (step.getOrNull(gapIdx)?.a ?: selected).orEmpty() else "— — —"
            val slotColor by animateColorAsState(
                targetValue = if (lastCorrect == true) Color(0xFFFFE3A6) else Color(0xFFD9B667),
                animationSpec = tween(280),
                label = "slot",
            )
            Text(
                text = if (unused < 0) "" else slotWord,
                modifier = Modifier
                    .fillMaxWidth()
                    .graphicsLayer { translationY = -10f * fly }
                    .background(Color(0xD9140D07))
                    .border(1.dp, if (lastCorrect == true) CtvColors.goldHot else CtvColors.tabBorder)
                    .padding(vertical = 12.dp),
                color = slotColor,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                letterSpacing = 0.12.em,
                textAlign = TextAlign.Center,
            )
        }
        if (fracture > 0f) {
            Box(
                Modifier
                    .matchParentSize()
                    .offset(x = (fracture * 4).dp)
                    .background(CtvColors.bloodHot.copy(alpha = 0.28f * fracture)),
            )
        }
    }
}

@Composable
private fun StepPips(tabletIdx: Int, total: Int) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        repeat(total) { i ->
            Box(
                Modifier
                    .defaultMinSize(minWidth = 8.dp, minHeight = 8.dp)
                    .height(8.dp)
                    .then(Modifier.widthIn(min = 8.dp))
                    .background(
                        when {
                            i < tabletIdx -> CtvColors.gold
                            i == tabletIdx -> CtvColors.goldHot
                            else -> Color(0xFF3A3224)
                        },
                    ),
            )
        }
    }
}

@Composable
private fun StoneGrid(
    choices: List<String>,
    grey: List<String>,
    selected: String?,
    answer: String,
    lastCorrect: Boolean?,
    hinted: Boolean,
    locked: Boolean,
    onPick: (String) -> Unit,
) {
    Column(
        modifier = Modifier.widthIn(max = 560.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        choices.chunked(2).forEach { row ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { word ->
                    val dim = word in grey
                    val state = when {
                        lastCorrect == null -> when {
                            word == selected -> "sel"
                            hinted && word.equals(answer, ignoreCase = true) -> "hint"
                            else -> "idle"
                        }
                        word.equals(answer, ignoreCase = true) -> "right"
                        word == selected -> "bad"
                        else -> "mute"
                    }
                    StoneButton(
                        letter = LETTERS.getOrElse(choices.indexOf(word)) { "" },
                        text = word,
                        state = state,
                        dim = dim,
                        enabled = !locked && !dim,
                        onClick = { onPick(word) },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun StoneButton(
    letter: String,
    text: String,
    state: String,
    dim: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val bg = when (state) {
        "right" -> Brush.verticalGradient(listOf(Color(0xFFC9A46A), Color(0xFF7A5A2A)))
        "bad" -> Brush.verticalGradient(listOf(Color(0xFF6B171C), Color(0xFF25070A)))
        "sel", "hint" -> Brush.verticalGradient(listOf(Color(0xFFB8944E), Color(0xFF5C4018)))
        else -> Brush.verticalGradient(listOf(CtvColors.tabBg1, CtvColors.tabBg3))
    }
    val border = when (state) {
        "right", "hint" -> CtvColors.goldHot
        "bad" -> CtvColors.bloodHot
        "sel" -> CtvColors.gold
        else -> CtvColors.tabBorder
    }
    Text(
        text = buildAnnotatedString {
            withStyle(SpanStyle(color = CtvColors.goldDim, fontWeight = FontWeight.Medium)) {
                append("$letter  ")
            }
            append(text)
        },
        modifier = modifier
            .alpha(if (dim || state == "mute") 0.32f else 1f)
            .defaultMinSize(minHeight = 44.dp)
            .background(bg)
            .border(1.dp, border)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 14.dp),
        color = if (state == "bad") Color(0xFFFFDEDF) else Color(0xFFF4E8D0),
        fontFamily = CtvFonts.body,
        fontSize = 16.sp,
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun PauseOverlay(
    remain: String,
    lamps: Int,
    favor: Int,
    confirmAbandon: Boolean,
    tutorial: Boolean,
    onResume: () -> Unit,
    onAbandonRequest: () -> Unit,
    onStay: () -> Unit,
    onConfirmAbandon: () -> Unit,
) {
    Box(
        Modifier
            .fillMaxSize()
            .background(Color(0xE604040A))
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() },
                onClick = {},
            ),
        contentAlignment = Alignment.Center,
    ) {
        HallPanel(cut = 14.dp, modifier = Modifier.widthIn(max = 420.dp).fillMaxWidth().padding(horizontal = 20.dp)) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                if (confirmAbandon) {
                    Kick("The Hold")
                    Spacer(Modifier.height(8.dp))
                    GoldHeadline(if (tutorial) "Leave the prayer?" else "Leave this run?")
                    Text(
                        text = if (tutorial) "The Hall waits until the prayer is held."
                        else "Abandon returns you to the hall. A started Hold is still written.",
                        color = CtvColors.parchDim,
                        fontFamily = CtvFonts.body,
                        fontStyle = FontStyle.Italic,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 10.dp),
                    )
                    Spacer(Modifier.height(22.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        GhostButton("Stay", onClick = onStay)
                        GoldButton("Quit to hall", onClick = onConfirmAbandon, small = true)
                    }
                } else {
                    Kick("Paused")
                    Spacer(Modifier.height(8.dp))
                    GoldHeadline("Selah")
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = "$remain  ·  Lamps ×$lamps  ·  Favor $favor",
                        color = CtvColors.goldDim,
                        fontFamily = CtvFonts.ui,
                        fontSize = 13.sp,
                        letterSpacing = 0.12.em,
                    )
                    Spacer(Modifier.height(22.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        GoldButton("Resume", onClick = onResume, small = true)
                        GhostButton(if (tutorial) "Leave" else "Abandon run", onClick = onAbandonRequest)
                    }
                }
            }
        }
    }
}
