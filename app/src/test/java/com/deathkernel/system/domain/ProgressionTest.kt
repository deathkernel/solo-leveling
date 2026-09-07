package com.deathkernel.system.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProgressionTest {
    @Test
    fun startsAtLevelOne() {
        assertEquals(1, Progression.levelForTotalXp(0))
        assertEquals(1000, Progression.xpForNextLevel(1))
    }

    @Test
    fun levelsUpWithoutLosingXp() {
        assertEquals(2, Progression.levelForTotalXp(1000))
        assertEquals(3, Progression.levelForTotalXp(1000 + 1150))
    }

    @Test
    fun rankThresholdsAreStable() {
        assertEquals(Rank.E, Progression.rankForLevel(1))
        assertEquals(Rank.D, Progression.rankForLevel(10))
        assertEquals(Rank.C, Progression.rankForLevel(20))
        assertEquals(Rank.B, Progression.rankForLevel(30))
        assertEquals(Rank.A, Progression.rankForLevel(40))
        assertEquals(Rank.S, Progression.rankForLevel(50))
    }

    @Test
    fun xpProgressIsBounded() {
        val player = com.deathkernel.system.data.PlayerEntity(level = 2, xp = 100)
        val progress = PlayerProgress.from(player)
        assertTrue(progress.levelProgress in 0f..1f)
    }
}
