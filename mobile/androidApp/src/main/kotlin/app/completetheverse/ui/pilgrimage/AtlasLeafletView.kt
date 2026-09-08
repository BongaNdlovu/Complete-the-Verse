package app.completetheverse.ui.pilgrimage

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import app.completetheverse.core.pilgrimage.PilgrimProgress
import app.completetheverse.core.pilgrimage.Pilgrimage
import app.completetheverse.core.pilgrimage.Site
import org.json.JSONArray
import org.json.JSONObject

class AtlasBridge(private val onSite: (String) -> Unit) {
    @JavascriptInterface
    fun onSite(id: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).post { onSite.invoke(id) }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AtlasLeafletView(
    sites: List<Site>,
    progress: PilgrimProgress,
    engine: Pilgrimage?,
    currentId: String?,
    onOpenSite: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val payload = remember(sites, progress, currentId, engine) {
        val arr = JSONArray()
        sites.forEach { s ->
            arr.put(
                JSONObject()
                    .put("id", s.id)
                    .put("lat", s.lat)
                    .put("lng", s.lng)
                    .put("unlocked", engine?.isUnlocked(progress, s.id) == true)
                    .put("cleared", engine?.isCleared(progress, s.id) == true)
                    .put("perfect", engine?.recordOf(progress, s.id)?.perfect == true)
                    .put("current", s.id == currentId),
            )
        }
        val focus = sites.firstOrNull { it.id == currentId } ?: sites.firstOrNull()
        JSONObject()
            .put("sites", arr)
            .put(
                "focus",
                if (focus == null) JSONObject.NULL
                else JSONObject().put("lat", focus.lat).put("lng", focus.lng).put("zoom", 7),
            )
            .toString()
    }
    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                addJavascriptInterface(AtlasBridge(onOpenSite), "CtvAtlas")
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        view?.evaluateJavascript("paintAtlas(" + JSONObject.quote(payload) + ")", null)
                    }
                }
                loadUrl("file:///android_asset/atlas/index.html")
            }
        },
        update = { view ->
            view.evaluateJavascript("paintAtlas(" + JSONObject.quote(payload) + ")", null)
        },
    )
}
