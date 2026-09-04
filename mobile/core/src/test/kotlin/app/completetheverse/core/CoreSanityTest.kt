package app.completetheverse.core

import kotlin.test.Test
import kotlin.test.assertEquals

class CoreSanityTest {
    @Test
    fun packageNameMatchesApplicationIdRoot() {
        assertEquals("app.completetheverse.core", Core.PACKAGE_NAME)
    }
}
