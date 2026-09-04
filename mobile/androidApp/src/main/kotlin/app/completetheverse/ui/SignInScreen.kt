package app.completetheverse.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import app.completetheverse.ui.components.Filigree
import app.completetheverse.ui.components.GhostButton
import app.completetheverse.ui.components.GoldButton
import app.completetheverse.ui.components.GoldHeadline
import app.completetheverse.ui.components.HallBackdrop
import app.completetheverse.ui.components.Kick
import app.completetheverse.ui.theme.CtvColors
import app.completetheverse.ui.theme.CtvFonts

@Composable
fun SignInScreen(
    email: String,
    otp: String,
    status: String,
    busy: Boolean,
    signedIn: Boolean,
    signedInEmail: String?,
    onEmailChange: (String) -> Unit,
    onOtpChange: (String) -> Unit,
    onSendCode: () -> Unit,
    onVerify: () -> Unit,
    onSignOut: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = CtvColors.gold,
        unfocusedBorderColor = CtvColors.edge,
        disabledBorderColor = CtvColors.edge.copy(alpha = 0.4f),
        focusedTextColor = CtvColors.parch,
        unfocusedTextColor = CtvColors.parch,
        disabledTextColor = CtvColors.parchDim,
        cursorColor = CtvColors.goldHot,
        focusedLabelColor = CtvColors.goldDim,
        unfocusedLabelColor = CtvColors.goldDim,
        disabledLabelColor = CtvColors.parchDim,
    )
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
            Row(
                modifier = Modifier
                    .widthIn(max = 640.dp)
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
                    Kick("Cloud")
                    Spacer(Modifier.height(4.dp))
                    GoldHeadline("Sign in")
                }
                GhostButton("Back", onClick = onBack)
            }
            Column(
                modifier = Modifier
                    .widthIn(max = 480.dp)
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Filigree()
                Text(
                    text = if (signedIn) {
                        "Signed in${signedInEmail?.let { " as $it" } ?: ""}."
                    } else {
                        "Sign in to merge this device with the cloud save and post Blitz."
                    },
                    color = CtvColors.parchDim,
                    fontFamily = CtvFonts.body,
                    fontSize = 16.sp,
                    lineHeight = 24.sp,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(20.dp))
                if (!signedIn) {
                    OutlinedTextField(
                        value = email,
                        onValueChange = onEmailChange,
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        enabled = !busy,
                        label = { Text("Email") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        colors = fieldColors,
                    )
                    Spacer(Modifier.height(12.dp))
                    GoldButton(
                        text = "Send code",
                        onClick = onSendCode,
                        modifier = Modifier
                            .fillMaxWidth()
                            .alpha(if (!busy && email.isNotBlank()) 1f else 0.45f),
                    )
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = otp,
                        onValueChange = { value ->
                            if (value.length <= 6 && value.all { it.isDigit() }) onOtpChange(value)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        enabled = !busy,
                        label = { Text("6-digit code") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = fieldColors,
                    )
                    Spacer(Modifier.height(12.dp))
                    GoldButton(
                        text = "Verify",
                        onClick = onVerify,
                        modifier = Modifier
                            .fillMaxWidth()
                            .alpha(if (!busy && otp.length == 6) 1f else 0.45f),
                    )
                } else {
                    GhostButton(
                        text = "Sign out",
                        onClick = onSignOut,
                        modifier = Modifier.alpha(if (busy) 0.45f else 1f),
                    )
                    Text(
                        text = "Progress stays on this device.",
                        modifier = Modifier.padding(top = 12.dp),
                        color = CtvColors.parchDim,
                        fontFamily = CtvFonts.body,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                    )
                }
                if (status.isNotEmpty()) {
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = status,
                        color = CtvColors.goldHot,
                        fontFamily = CtvFonts.body,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                    )
                }
                if (busy) {
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = "Working…",
                        color = CtvColors.goldDim,
                        fontFamily = CtvFonts.ui,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        letterSpacing = 0.16.em,
                    )
                }
            }
        }
    }
}
