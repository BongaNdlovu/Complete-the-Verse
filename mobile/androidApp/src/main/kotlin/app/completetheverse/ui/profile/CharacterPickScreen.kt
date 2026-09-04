package app.completetheverse.ui.profile

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.core.characters.Scholar
import app.completetheverse.core.characters.Scholars
import app.completetheverse.core.cloud.AuthNotice
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts
import app.completetheverse.ui.theme.HallCutShape

@Composable
fun CharacterPickScreen(
    initialName: String,
    initialScholarId: String,
    fromSettings: Boolean,
    onConfirm: (name: String, scholarId: String) -> Unit,
    onBack: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    var name by rememberSaveable { mutableStateOf(initialName) }
    var scholarId by rememberSaveable { mutableStateOf(Scholars.resolve(initialScholarId).id) }
    var hint by rememberSaveable { mutableStateOf("") }
    val canConfirm = name.trim().length >= 2 && Scholars.isScholar(scholarId)

    BackHandler(enabled = onBack != null) { onBack?.invoke() }

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
            Row(
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .drawBehind {
                        drawLine(
                            color = CtvColors.edge,
                            start = Offset(0f, size.height),
                            end = Offset(size.width, size.height),
                            strokeWidth = 1.dp.toPx(),
                        )
                    }
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f).padding(end = 12.dp)) {
                    Kick("Profile")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline("Who are you on the road?")
                }
                if (onBack != null) {
                    GhostButton("Back", onClick = onBack)
                }
            }
            Text(
                text = "Choose a scholar, then give them your name. They walk the map.",
                modifier = Modifier
                    .widthIn(max = 520.dp)
                    .padding(bottom = 8.dp),
                color = CtvColors.parchDim,
                fontFamily = CtvFonts.body,
                fontSize = 16.sp,
                lineHeight = 24.sp,
                textAlign = TextAlign.Center,
            )
            Filigree()
            Text(
                text = "Your name",
                color = CtvColors.goldDim,
                fontFamily = CtvFonts.ui,
                fontWeight = FontWeight.SemiBold,
                fontSize = 11.sp,
                letterSpacing = 0.18.em,
            )
            OutlinedTextField(
                value = name,
                onValueChange = { value ->
                    if (value.length <= 32) {
                        name = value
                        hint = ""
                    }
                },
                modifier = Modifier
                    .widthIn(max = 420.dp)
                    .fillMaxWidth()
                    .padding(top = 6.dp, bottom = 12.dp),
                singleLine = true,
                placeholder = { Text("e.g. Miriam") },
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Words,
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CtvColors.gold,
                    unfocusedBorderColor = CtvColors.edge,
                    focusedTextColor = CtvColors.parch,
                    unfocusedTextColor = CtvColors.parch,
                    cursorColor = CtvColors.goldHot,
                    focusedPlaceholderColor = CtvColors.parchDim,
                    unfocusedPlaceholderColor = CtvColors.parchDim,
                ),
            )
            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 148.dp),
                modifier = Modifier
                    .widthIn(max = 720.dp)
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 12.dp),
            ) {
                items(Scholars.ALL, key = { it.id }) { scholar ->
                    ScholarCard(
                        scholar = scholar,
                        selected = scholar.id == scholarId,
                        onClick = { scholarId = scholar.id },
                    )
                }
            }
            if (hint.isNotEmpty()) {
                Text(
                    text = hint,
                    color = CtvColors.bloodHot,
                    fontFamily = CtvFonts.body,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(bottom = 8.dp),
                    textAlign = TextAlign.Center,
                )
            }
            GoldButton(
                text = if (fromSettings) "Save" else "Enter the hall",
                onClick = {
                    val trimmed = name.trim()
                    if (trimmed.length < 2) {
                        hint = AuthNotice.notice("name-too-short")
                        return@GoldButton
                    }
                    onConfirm(trimmed, scholarId)
                },
                modifier = Modifier
                    .widthIn(max = 420.dp)
                    .fillMaxWidth()
                    .alpha(if (canConfirm) 1f else 0.45f),
            )
        }
    }
}

@Composable
private fun ScholarCard(
    scholar: Scholar,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val shape = HallCutShape(12.dp)
    Column(
        modifier = Modifier
            .defaultMinSize(minHeight = 44.dp)
            .clip(shape)
            .background(CtvColors.ink.copy(alpha = 0.55f), shape)
            .border(1.dp, if (selected) CtvColors.gold else CtvColors.edge, shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Image(
            painter = painterResource(ScholarArt.portrait(scholar.id)),
            contentDescription = scholar.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(88.dp)
                .clip(CircleShape)
                .border(2.dp, CtvColors.gold.copy(alpha = 0.45f), CircleShape),
        )
        Text(
            text = scholar.short,
            color = CtvColors.gold,
            fontFamily = CtvFonts.display,
            fontWeight = FontWeight.SemiBold,
            fontSize = 15.sp,
            letterSpacing = 0.06.em,
            modifier = Modifier.padding(top = 8.dp),
            textAlign = TextAlign.Center,
        )
        Text(
            text = scholar.nationality.uppercase(),
            color = CtvColors.azure,
            fontFamily = CtvFonts.ui,
            fontSize = 11.sp,
            letterSpacing = 0.14.em,
            textAlign = TextAlign.Center,
        )
        Text(
            text = scholar.blurb,
            color = CtvColors.parchDim,
            fontFamily = CtvFonts.body,
            fontSize = 12.sp,
            lineHeight = 16.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 6.dp),
        )
    }
}
