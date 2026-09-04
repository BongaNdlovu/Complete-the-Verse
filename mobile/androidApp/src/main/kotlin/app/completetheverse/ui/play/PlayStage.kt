package app.completetheverse.ui.play

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import app.completetheverse.core.assemble.Assemble
import app.completetheverse.core.assemble.AssembleBoard
import app.completetheverse.core.assemble.TapTarget
import app.completetheverse.core.bank.Bank
import app.completetheverse.core.bank.TfClaim
import app.completetheverse.core.bank.Verse
import app.completetheverse.core.play.ClozeBoard
import app.completetheverse.core.play.DuelBoard
import app.completetheverse.core.play.FadePhase
import app.completetheverse.core.play.Mechanic
import app.completetheverse.core.play.OverdriveChoice
import app.completetheverse.core.play.PlayMechanics
import app.completetheverse.core.play.PlayPhase
import app.completetheverse.core.play.PlayResult
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.HallPanel
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import app.completetheverse.ui.theme.SkewButtonShape

private val LETTERS = listOf("A", "B", "C", "D")

@Composable
fun PlayStage(
    title: String,
    mechanic: Mechanic?,
    verse: Verse?,
    claim: TfClaim?,
    index: Int,
    total: Int,
    remainingMs: Long,
    durationMs: Long,
    lives: Int,
    maxLives: Int,
    score: Int,
    streak: Int,
    multiplier: Int,
    correctCount: Int,
    attemptCount: Int,
    locked: Boolean,
    lastCorrect: Boolean?,
    selected: String?,
    tfPickedTrue: Boolean?,
    choices: List<String>,
    assemble: AssembleBoard?,
    cloze: ClozeBoard?,
    duel: DuelBoard?,
    fadePhase: FadePhase?,
    boardTick: Int,
    phase: PlayPhase,
    confirmAbandon: Boolean,
    overdriveBank: Int,
    result: PlayResult?,
    onChoice: (String) -> Unit,
    onAssembleChange: () -> Unit,
    onLockAssemble: () -> Unit,
    onClozeUnfill: (Int) -> Unit,
    onTrueFalse: (Boolean) -> Unit,
    onFadeDone: () -> Unit,
    onPause: () -> Unit,
    onResume: () -> Unit,
    onAbandonRequest: () -> Unit,
    onStay: () -> Unit,
    onConfirmAbandon: () -> Unit,
    onOverdrive: (OverdriveChoice) -> Unit,
    onHall: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (phase == PlayPhase.Results && result != null) {
        PlayResultsScreen(title = title, result = result, onHall = onHall, modifier = modifier)
        return
    }
    val denom = durationMs.coerceAtLeast(1L)
    val sec = ((remainingMs + 999) / 1000).coerceAtLeast(0)
    val crit = sec <= 5 && !locked && phase == PlayPhase.Playing
    val frac = (remainingMs.toFloat() / denom).coerceIn(0f, 1f)
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
            PlayHeader(
                title = title,
                index = index,
                total = total,
                sec = sec,
                crit = crit,
                frac = frac,
                lives = lives,
                maxLives = maxLives,
                score = score,
                streak = streak,
                multiplier = multiplier,
                onPause = onPause,
            )
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(top = 18.dp, bottom = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                PlayBody(
                    mechanic = mechanic,
                    verse = verse,
                    claim = claim,
                    fadePhase = fadePhase,
                    lastCorrect = lastCorrect,
                    locked = locked,
                    selected = selected,
                    tfPickedTrue = tfPickedTrue,
                    choices = choices,
                    assemble = assemble,
                    cloze = cloze,
                    duel = duel,
                    boardTick = boardTick,
                    onChoice = onChoice,
                    onAssembleChange = onAssembleChange,
                    onLockAssemble = onLockAssemble,
                    onClozeUnfill = onClozeUnfill,
                    onTrueFalse = onTrueFalse,
                    onFadeDone = onFadeDone,
                )
            }
        }
        if (phase == PlayPhase.Paused || confirmAbandon) {
            PauseOverlay(
                score = score,
                streak = streak,
                accuracy = if (attemptCount == 0) "—" else "${(correctCount * 100) / attemptCount}%",
                progress = "${index + 1} / $total",
                confirmAbandon = confirmAbandon,
                onResume = onResume,
                onAbandonRequest = onAbandonRequest,
                onStay = onStay,
                onConfirmAbandon = onConfirmAbandon,
            )
        }
        if (phase == PlayPhase.Overdrive) {
            OverdriveDialog(
                bank = overdriveBank,
                onRide = { onOverdrive(OverdriveChoice.Ride) },
                onBank = { onOverdrive(OverdriveChoice.Bank) },
            )
        }
    }
}

@Composable
private fun PlayHeader(
    title: String,
    index: Int,
    total: Int,
    sec: Long,
    crit: Boolean,
    frac: Float,
    lives: Int,
    maxLives: Int,
    score: Int,
    streak: Int,
    multiplier: Int,
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
                    text = title.uppercase(),
                    color = CtvColors.gold,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    letterSpacing = 0.18.em,
                )
                Text(
                    text = "Q ${index + 1} / $total",
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontSize = 11.sp,
                    letterSpacing = 0.16.em,
                )
            }
            Column(horizontalAlignment = Alignment.End, modifier = Modifier.widthIn(min = 88.dp)) {
                Text(
                    text = "00:" + sec.toString().padStart(2, '0'),
                    color = if (crit) CtvColors.bloodHot else CtvColors.goldHot,
                    fontFamily = CtvFonts.display,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
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
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                repeat(maxLives.coerceAtLeast(0)) { i ->
                    Box(
                        Modifier
                            .size(12.dp)
                            .background(
                                if (i < lives) CtvColors.goldHot else Color(0xFF3A3224),
                                CircleShape,
                            )
                            .border(1.dp, CtvColors.goldDeep, CircleShape),
                    )
                }
                if (maxLives > 0) {
                    Text(
                        text = "$lives",
                        color = CtvColors.gold,
                        fontFamily = CtvFonts.ui,
                        fontSize = 12.sp,
                    )
                }
            }
            Text(
                text = "×$multiplier  ·  $streak  ·  $score",
                color = if (multiplier > 1) CtvColors.goldHot else CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontSize = 12.sp,
                letterSpacing = 0.12.em,
            )
        }
    }
}

@Composable
private fun PlayBody(
    mechanic: Mechanic?,
    verse: Verse?,
    claim: TfClaim?,
    fadePhase: FadePhase?,
    lastCorrect: Boolean?,
    locked: Boolean,
    selected: String?,
    tfPickedTrue: Boolean?,
    choices: List<String>,
    assemble: AssembleBoard?,
    cloze: ClozeBoard?,
    duel: DuelBoard?,
    boardTick: Int,
    onChoice: (String) -> Unit,
    onAssembleChange: () -> Unit,
    onLockAssemble: () -> Unit,
    onClozeUnfill: (Int) -> Unit,
    onTrueFalse: (Boolean) -> Unit,
    onFadeDone: () -> Unit,
) {
    val how = when (mechanic) {
        Mechanic.PassageRef -> "Name the Passage"
        Mechanic.Cloze -> "1-2-3 Rapid Cloze"
        Mechanic.Duel -> "True Scripture Duel"
        Mechanic.Fade -> if (fadePhase == FadePhase.Reconstruct) "Choose the true King James verse" else "Fade-to-Memory"
        Mechanic.TrueFalse -> "The Judgement"
        Mechanic.Assemble -> "Place the words"
        else -> "Complete the verse"
    }
    Text(
        text = how.uppercase(),
        color = CtvColors.goldDim,
        fontFamily = CtvFonts.ui,
        fontSize = 11.sp,
        letterSpacing = 0.18.em,
        modifier = Modifier.padding(bottom = 10.dp),
    )
    when (mechanic) {
        Mechanic.PassageRef -> if (verse != null) {
            Text(
                text = PlayMechanics.fullQuestionPassage(verse),
                modifier = Modifier.widthIn(max = 640.dp),
                color = Color(0xFFF4EFE4),
                fontFamily = CtvFonts.body,
                fontSize = 22.sp,
                lineHeight = 30.sp,
                textAlign = TextAlign.Center,
            )
            Text(
                text = "Passage identification  —  King James Version",
                modifier = Modifier.padding(top = 14.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
            )
            Spacer(Modifier.height(18.dp))
            ChoiceGrid(
                choices = choices,
                locked = locked,
                selected = selected,
                answer = verse.r,
                lastCorrect = lastCorrect,
                onChoice = onChoice,
            )
        }
        Mechanic.Duel -> if (duel != null) {
            Text(
                text = "Discern the genuine King James reading",
                color = Color(0xFFF4EFE4),
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 640.dp).padding(bottom = 16.dp),
            )
            DuelCards(duel = duel, locked = locked, lastCorrect = lastCorrect, selected = selected, onChoice = onChoice)
        }
        Mechanic.TrueFalse -> if (claim != null) {
            Text(
                text = "The Witness Speaks · Judge the Claim",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 16.sp,
                modifier = Modifier.padding(bottom = 12.dp),
            )
            Text(
                text = claim.s,
                color = Color(0xFFF4EFE4),
                fontFamily = CtvFonts.body,
                fontSize = 22.sp,
                lineHeight = 30.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 640.dp).padding(bottom = 18.dp),
            )
            TrueFalseButtons(
                claim = claim,
                locked = locked,
                lastCorrect = lastCorrect,
                selectedTrue = tfPickedTrue,
                onPick = onTrueFalse,
            )
            if (locked && lastCorrect == false) {
                Text(
                    text = (if (claim.v) "TRUE" else "FALSE") + " — " + claim.why,
                    color = CtvColors.goldHot,
                    fontFamily = CtvFonts.body,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.widthIn(max = 640.dp).padding(top = 14.dp),
                )
            }
        }
        Mechanic.Fade -> if (verse != null) {
            if (fadePhase == FadePhase.Memorize) {
                VerseStem(verse, filled = true, lastCorrect = true)
                Text(
                    text = "${verse.r}  —  KJV",
                    modifier = Modifier.padding(top = 14.dp),
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 15.sp,
                )
                Spacer(Modifier.height(22.dp))
                GoldButton("I'm Done", onClick = onFadeDone, small = true)
            } else {
                Text(
                    text = "Which line did you just memorize?",
                    color = Color(0xFFF4EFE4),
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 18.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.widthIn(max = 640.dp).padding(bottom = 16.dp),
                )
                ChoiceGrid(
                    choices = choices,
                    locked = locked,
                    selected = selected,
                    answer = PlayMechanics.fullVerseText(verse),
                    lastCorrect = lastCorrect,
                    onChoice = onChoice,
                )
            }
        }
        Mechanic.Cloze -> if (verse != null && cloze != null) {
            VerseStem(verse, filled = cloze.filled.isNotEmpty() || lastCorrect != null, lastCorrect = lastCorrect, filledText = cloze.joined())
            Text(
                text = "${verse.r}  —  KJV",
                modifier = Modifier.padding(top = 14.dp, bottom = 18.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
            )
            ClozeBoardUi(board = cloze, tick = boardTick, locked = locked, onPick = onChoice, onUnfill = onClozeUnfill)
        }
        Mechanic.Assemble -> if (verse != null && assemble != null) {
            VerseStem(verse, filled = lastCorrect != null, lastCorrect = lastCorrect)
            Text(
                text = "${verse.r}  —  KJV",
                modifier = Modifier.padding(top = 14.dp, bottom = 18.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
            )
            AssembleBoardUi(
                board = assemble,
                tick = boardTick,
                locked = locked,
                lastCorrect = lastCorrect,
                onChange = onAssembleChange,
                onLock = onLockAssemble,
            )
        }
        else -> if (verse != null) {
            VerseStem(verse, filled = lastCorrect != null, lastCorrect = lastCorrect)
            Text(
                text = "${verse.r}  —  KJV",
                modifier = Modifier.padding(top = 14.dp),
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.body,
                fontStyle = FontStyle.Italic,
                fontSize = 15.sp,
            )
            Spacer(Modifier.height(18.dp))
            ChoiceGrid(
                choices = choices,
                locked = locked,
                selected = selected,
                answer = verse.a,
                lastCorrect = lastCorrect,
                onChoice = onChoice,
            )
        }
    }
}

@Composable
private fun VerseStem(verse: Verse, filled: Boolean, lastCorrect: Boolean?, filledText: String? = null) {
    val sep = Bank.stemSep(verse.s)
    Text(
        text = buildAnnotatedString {
            withStyle(SpanStyle(color = Color(0xFFF4EFE4))) { append(verse.p) }
            append(" ")
            if (filled) {
                withStyle(
                    SpanStyle(
                        color = if (lastCorrect == false) CtvColors.bloodHot else CtvColors.goldHot,
                    ),
                ) { append(filledText ?: verse.a) }
            } else {
                withStyle(
                    SpanStyle(
                        color = Color.Transparent,
                        textDecoration = TextDecoration.Underline,
                    ),
                ) { append("   ") }
            }
            append(sep)
            withStyle(SpanStyle(color = Color(0xFFF4EFE4))) { append(verse.s) }
        },
        modifier = Modifier.widthIn(max = 640.dp),
        fontFamily = CtvFonts.body,
        fontSize = 22.sp,
        lineHeight = 30.sp,
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun ChoiceGrid(
    choices: List<String>,
    locked: Boolean,
    selected: String?,
    answer: String,
    lastCorrect: Boolean?,
    onChoice: (String) -> Unit,
) {
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        choices.chunked(2).forEach { row ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                row.forEach { choice ->
                    val i = choices.indexOf(choice).coerceAtLeast(0)
                    val state = when {
                        lastCorrect == null -> if (choice == selected) "sel" else "idle"
                        choice == answer -> "right"
                        choice == selected -> "bad"
                        else -> "mute"
                    }
                    ChoiceButton(
                        letter = LETTERS.getOrElse(i) { "" },
                        text = choice,
                        state = state,
                        enabled = !locked,
                        onClick = { onChoice(choice) },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun ChoiceButton(
    letter: String,
    text: String,
    state: String,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val bg = when (state) {
        "right" -> Brush.verticalGradient(listOf(Color(0xFF1D5E3C), Color(0xFF08251A)))
        "bad" -> Brush.verticalGradient(listOf(Color(0xFF6B171C), Color(0xFF25070A)))
        "sel" -> Brush.verticalGradient(listOf(Color(0xFF4A3D1C), Color(0xFF191307)))
        else -> Brush.verticalGradient(listOf(Color(0xFF31353D), Color(0xFF0A0C10)))
    }
    val fg = when (state) {
        "right" -> Color(0xFFE9FFF2)
        "bad" -> Color(0xFFFFDEDF)
        else -> Color(0xFFDDD6C6)
    }
    val border = when (state) {
        "right" -> CtvColors.green
        "bad" -> CtvColors.bloodHot
        "sel" -> CtvColors.goldHot
        else -> Color(0xFF4A4E57)
    }
    Text(
        text = buildAnnotatedString {
            if (letter.isNotEmpty()) {
                withStyle(SpanStyle(color = CtvColors.goldDim, fontWeight = FontWeight.Medium)) {
                    append("$letter.  ")
                }
            }
            append(text)
        },
        modifier = modifier
            .alpha(if (state == "mute") 0.34f else 1f)
            .defaultMinSize(minHeight = 44.dp)
            .background(bg)
            .border(1.dp, border)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 16.dp),
        color = fg,
        fontFamily = CtvFonts.body,
        fontSize = 16.sp,
        textAlign = TextAlign.Center,
    )
}

@Composable
private fun DuelCards(
    duel: DuelBoard,
    locked: Boolean,
    lastCorrect: Boolean?,
    selected: String?,
    onChoice: (String) -> Unit,
) {
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        listOf(
            Triple("Reading Alpha", duel.leftText, duel.leftVal),
            Triple("Reading Beta", duel.rightText, duel.rightVal),
        ).forEach { (tag, text, value) ->
            val state = when {
                lastCorrect == null -> if (value == selected) "sel" else "idle"
                value == duel.correctVal -> "right"
                value == selected -> "bad"
                else -> "mute"
            }
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .alpha(if (state == "mute") 0.34f else 1f)
                    .defaultMinSize(minHeight = 44.dp)
                    .background(
                        when (state) {
                            "right" -> Brush.verticalGradient(listOf(Color(0xFF1D5E3C), Color(0xFF08251A)))
                            "bad" -> Brush.verticalGradient(listOf(Color(0xFF6B171C), Color(0xFF25070A)))
                            "sel" -> Brush.verticalGradient(listOf(Color(0xFF4A3D1C), Color(0xFF191307)))
                            else -> Brush.verticalGradient(listOf(Color(0xFF31353D), Color(0xFF0A0C10)))
                        },
                    )
                    .border(
                        1.dp,
                        when (state) {
                            "right" -> CtvColors.green
                            "bad" -> CtvColors.bloodHot
                            "sel" -> CtvColors.goldHot
                            else -> Color(0xFF4A4E57)
                        },
                    )
                    .clickable(enabled = !locked, role = Role.Button) { onChoice(value) }
                    .padding(horizontal = 16.dp, vertical = 16.dp),
            ) {
                Text(
                    text = tag.uppercase(),
                    color = CtvColors.goldDim,
                    fontFamily = CtvFonts.ui,
                    fontSize = 11.sp,
                    letterSpacing = 0.16.em,
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = text,
                    color = Color(0xFFF4EFE4),
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                )
            }
        }
    }
}

@Composable
private fun TrueFalseButtons(
    claim: TfClaim,
    locked: Boolean,
    lastCorrect: Boolean?,
    selectedTrue: Boolean?,
    onPick: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        listOf(true to "True", false to "False").forEach { (value, label) ->
            val isRight = value == claim.v
            val isSel = selectedTrue == value
            val state = when {
                lastCorrect == null -> if (isSel) "sel" else "idle"
                isRight -> "right"
                isSel -> "bad"
                else -> "mute"
            }
            ChoiceButton(
                letter = "",
                text = label,
                state = state,
                enabled = !locked,
                onClick = { onPick(value) },
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ClozeBoardUi(
    board: ClozeBoard,
    tick: Int,
    locked: Boolean,
    onPick: (String) -> Unit,
    onUnfill: (Int) -> Unit,
) {
    val observed = tick
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth().then(if (observed >= 0) Modifier else Modifier),
        ) {
            board.words.forEachIndexed { i, _ ->
                val filled = i < board.filled.size
                Text(
                    text = if (filled) board.filled[i] else "[ ${i + 1}. ___ ]",
                    modifier = Modifier
                        .defaultMinSize(minHeight = 44.dp, minWidth = 44.dp)
                        .background(if (filled) Color(0xE61C1F26) else Color(0xB306070A))
                        .border(1.dp, if (filled) CtvColors.gold else Color(0xFF4A4E57))
                        .clickable(enabled = !locked && filled) { onUnfill(i) }
                        .padding(horizontal = 12.dp, vertical = 12.dp),
                    color = Color(0xFFF2E8D4),
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            board.bank.distinct().forEach { word ->
                val spent = !board.canSpend(word)
                Text(
                    text = word,
                    modifier = Modifier
                        .alpha(if (spent) 0.3f else 1f)
                        .defaultMinSize(minHeight = 44.dp, minWidth = 44.dp)
                        .background(
                            Brush.verticalGradient(listOf(Color(0xFF31353D), Color(0xFF0A0C10))),
                        )
                        .border(1.dp, Color(0xFF4A4E57))
                        .clickable(enabled = !locked && !spent) { onPick(word) }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    color = Color(0xFFDDD6C6),
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AssembleBoardUi(
    board: AssembleBoard,
    tick: Int,
    locked: Boolean,
    lastCorrect: Boolean?,
    onChange: () -> Unit,
    onLock: () -> Unit,
) {
    val lifted = Assemble.liftedTile(board)?.id
    Column(
        modifier = Modifier.widthIn(max = 640.dp).fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = if (tick < 0) "" else "PLACE THE WORDS",
            color = CtvColors.goldDim,
            fontFamily = CtvFonts.ui,
            fontSize = 11.sp,
            letterSpacing = 0.22.em,
            modifier = Modifier.padding(bottom = 10.dp),
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            board.placed.forEachIndexed { slot, tile ->
                val filled = tile != null
                val slotState = when {
                    lastCorrect == true && filled -> "ok"
                    lastCorrect == false && filled -> "no"
                    else -> if (filled) "full" else "empty"
                }
                Text(
                    text = if (filled) tile!!.word else " ",
                    modifier = Modifier
                        .defaultMinSize(minHeight = 44.dp, minWidth = 44.dp)
                        .widthIn(min = 88.dp)
                        .background(
                            if (slotState == "empty") Color(0xB306070A) else Color(0xE61C1F26),
                        )
                        .border(
                            1.dp,
                            when (slotState) {
                                "ok" -> CtvColors.green
                                "no" -> CtvColors.bloodHot
                                "full" -> CtvColors.gold
                                else -> Color(0xFF4A4E57)
                            },
                        )
                        .clickable(enabled = !locked) {
                            Assemble.resolveTap(board, TapTarget(slot = slot))
                            onChange()
                        }
                        .padding(horizontal = 12.dp, vertical = 12.dp),
                    color = Color(0xFFF2E8D4),
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Assemble.remaining(board).forEach { tile ->
                val on = tile.id == lifted
                Text(
                    text = tile.word,
                    modifier = Modifier
                        .defaultMinSize(minHeight = 44.dp, minWidth = 44.dp)
                        .background(
                            Brush.verticalGradient(
                                if (on) listOf(Color(0xFF4A3D1C), Color(0xFF191307))
                                else listOf(Color(0xFF31353D), Color(0xFF0A0C10)),
                            ),
                        )
                        .border(1.dp, if (on) CtvColors.goldHot else Color(0xFF4A4E57))
                        .clickable(enabled = !locked) {
                            Assemble.resolveTap(board, TapTarget(tileId = tile.id))
                            onChange()
                        }
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    color = Color(0xFFDDD6C6),
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                )
            }
        }
        Spacer(Modifier.height(18.dp))
        val ready = Assemble.isFilled(board)
        if (ready) {
            GoldButton(
                text = if (locked) "Answer locked" else "Lock answer",
                onClick = onLock,
                small = true,
            )
        } else {
            val shape = SkewButtonShape(10.dp)
            Text(
                text = "PLACE THE WORDS",
                modifier = Modifier
                    .alpha(0.35f)
                    .defaultMinSize(minHeight = 44.dp)
                    .border(1.dp, CtvColors.edge, shape)
                    .padding(horizontal = 18.dp, vertical = 12.dp),
                color = CtvColors.gold,
                fontFamily = CtvFonts.display,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp,
                letterSpacing = 0.24.em,
            )
        }
    }
}

@Composable
private fun PauseOverlay(
    score: Int,
    streak: Int,
    accuracy: String,
    progress: String,
    confirmAbandon: Boolean,
    onResume: () -> Unit,
    onAbandonRequest: () -> Unit,
    onStay: () -> Unit,
    onConfirmAbandon: () -> Unit,
) {
    Box(
        Modifier
            .fillMaxSize()
            .background(Color(0xE604040A)),
        contentAlignment = Alignment.Center,
    ) {
        HallPanel(cut = 14.dp, modifier = Modifier.widthIn(max = 420.dp).fillMaxWidth().padding(horizontal = 20.dp)) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                if (confirmAbandon) {
                    Kick("The record")
                    Spacer(Modifier.height(8.dp))
                    GoldHeadline("Leave this run?")
                    Filigree()
                    Text(
                        text = "Abandon returns you to the hall. A started run is still written.",
                        color = CtvColors.parchDim,
                        fontFamily = CtvFonts.body,
                        fontStyle = FontStyle.Italic,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center,
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
                    Filigree()
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                    ) {
                        PauseStat("$score", "Score")
                        PauseStat("$streak", "Streak")
                        PauseStat(accuracy, "Accuracy")
                        PauseStat(progress, "Distance")
                    }
                    Spacer(Modifier.height(22.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        GoldButton("Resume", onClick = onResume, small = true)
                        GhostButton("Abandon run", onClick = onAbandonRequest)
                    }
                }
            }
        }
    }
}

@Composable
private fun PauseStat(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            color = CtvColors.goldHot,
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
        )
        Text(
            text = label.uppercase(),
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.ui,
            fontSize = 10.sp,
            letterSpacing = 0.12.em,
        )
    }
}

@Composable
private fun OverdriveDialog(
    bank: Int,
    onRide: () -> Unit,
    onBank: () -> Unit,
) {
    Dialog(onDismissRequest = onBank) {
        HallPanel(cut = 14.dp, modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Kick("Overdrive")
                Spacer(Modifier.height(8.dp))
                GoldHeadline("The fire is yours")
                Filigree()
                Text(
                    text = "Ride the fire — every answer pays double, but one miss costs two lamps.\nBank the streak — cash $bank and reset to a safe ×1.",
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontStyle = FontStyle.Italic,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(22.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    GoldButton("Ride the fire", onClick = onRide, small = true)
                    GhostButton("Bank the streak", onClick = onBank)
                }
            }
        }
    }
}

@Composable
private fun PlayResultsScreen(
    title: String,
    result: PlayResult,
    onHall: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val acc = if (result.attempts == 0) 0 else (result.correct * 100) / result.attempts
    val seconds = result.elapsedMs / 1000.0
    Box(modifier.fillMaxSize()) {
        HallBackdrop()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Kick("The $title is finished")
            Spacer(Modifier.height(4.dp))
            GoldHeadline("The Record")
            Filigree()
            HallPanel(
                modifier = Modifier.widthIn(max = 520.dp).fillMaxWidth(),
                cut = 14.dp,
            ) {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 18.dp)) {
                    StatRow("Verses kept", "${result.correct} / ${result.attempts}")
                    StatRow("Accuracy", "$acc%")
                    StatRow("Time", String.format("%.1fs", seconds))
                    StatRow("Score", result.total.toString())
                    StatRow(
                        "Seals pending",
                        if (result.pendingSeals.isEmpty()) "None yet" else result.pendingSeals.joinToString(),
                    )
                }
            }
            Spacer(Modifier.height(28.dp))
            GoldButton("Return to the hall", onClick = onHall)
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontSize = 16.sp,
        )
        Text(
            text = value,
            color = CtvColors.goldHot,
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            textAlign = TextAlign.End,
        )
    }
}
