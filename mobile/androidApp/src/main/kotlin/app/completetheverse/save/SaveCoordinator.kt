package app.completetheverse.save

import app.completetheverse.core.save.Save
import app.completetheverse.core.save.SaveBlob
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/**
 * Process-lifetime in-memory save plus merge-on-write.
 * Persist is not tied to a composition scope; Hall/back cannot drop a locked review.
 */
class SaveCoordinator(
    private val repo: DataStoreSaveRepository,
) {
    private val mutex = Mutex()
    private val ioScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @Volatile
    private var memory: SaveBlob? = null

    fun snapshot(): SaveBlob = memory ?: Save.DEFAULT

    fun publish(save: SaveBlob) {
        memory = save
    }

    /** Populate memory from disk without writing. Safe if a run already published. */
    suspend fun loadFromDisk(): SaveBlob =
        withContext(Dispatchers.IO) {
            mutex.withLock {
                val successor = memory
                val disk = repo.load()
                val merged = Save.combineLocalSnapshots(successor, disk)
                memory = Save.commitPersist(merged, successor, memory)
                memory!!
            }
        }

    /**
     * Reload disk, merge with the in-memory blob (and optional extra such as a
     * cloud pull), persist, and publish. Survives cancellation.
     * A newer [publish] during the merge is kept as last-writer successor so
     * an in-flight verse write cannot drop Daily's first finished stamp.
     */
    suspend fun persistMerged(extra: SaveBlob? = null): SaveBlob =
        persistLocked(candidate = null, extra = extra)

    fun persistAsync(candidate: SaveBlob? = null) {
        if (candidate != null) memory = candidate
        ioScope.launch { persistLocked(candidate = candidate, extra = null) }
    }

    private suspend fun persistLocked(candidate: SaveBlob?, extra: SaveBlob?): SaveBlob =
        withContext(NonCancellable + Dispatchers.IO) {
            mutex.withLock {
                if (candidate != null) memory = candidate
                val successor = memory
                val disk = repo.load()
                val merged = Save.combineLocalSnapshots(successor, disk, extra)
                repo.persist(merged)
                memory = Save.commitPersist(merged, successor, memory)
                memory!!
            }
        }
}
