package app.completetheverse.core.pilgrimage

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class Site(
    val id: String,
    val name: String,
    val arc: String,
    val era: String = "",
    val quote: String = "",
    val quoteRef: String = "",
    val books: List<String> = emptyList(),
    val coords: List<Double> = emptyList(),
    val description: String = "",
    val context: String = "",
    val tag: String = "",
    val modernCountry: String = "",
    val place: String = "",
    val scripture: String = "",
) {
    val lat: Double get() = coords.getOrNull(0) ?: 0.0
    val lng: Double get() = coords.getOrNull(1) ?: 0.0
}

@Serializable
data class Arc(
    val key: String,
    val n: String = "",
    val name: String,
    val sub: String = "",
    val colour: String = "",
    val pal: String = "",
    val era: String = "",
    val books: List<String> = emptyList(),
)

data class RoadCatalog(
    val sites: List<Site>,
    val arcs: List<Arc>,
)

@Serializable
private data class SitesFile(
    val sites: List<Site> = emptyList(),
    val arcs: List<Arc> = emptyList(),
)

object Sites {
    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    fun parse(raw: String): RoadCatalog {
        val file = json.decodeFromString(SitesFile.serializer(), raw)
        return RoadCatalog(sites = file.sites, arcs = file.arcs)
    }
}
