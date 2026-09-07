package com.deathkernel.system.domain

object Progression {
    const val INITIAL_XP = 0
    const val INITIAL_LEVEL = 1
    const val XP_BASE = 1000
    const val XP_GROWTH = 1.15

    /** XP required to move from the given level to the next level. */
    fun xpForNextLevel(level: Int): Int {
        val safeLevel = level.coerceAtLeast(1)
        return (XP_BASE * Math.pow(XP_GROWTH, (safeLevel - 1).toDouble())).toInt()
    }

    /** Total XP required to reach the beginning of a level. */
    fun totalXpForLevel(level: Int): Long {
        val safeLevel = level.coerceAtLeast(1)
        var total = 0L
        for (currentLevel in 1 until safeLevel) {
            total += xpForNextLevel(currentLevel).toLong()
        }
        return total
    }

    /** Calculates the level from lifetime XP. XP is never lost when leveling up. */
    fun levelForTotalXp(totalXp: Long): Int {
        var level = INITIAL_LEVEL
        var remaining = totalXp.coerceAtLeast(0L)
        while (remaining >= xpForNextLevel(level).toLong()) {
            remaining -= xpForNextLevel(level).toLong()
            level++
        }
        return level
    }

    fun xpIntoCurrentLevel(totalXp: Long): Int {
        val level = levelForTotalXp(totalXp)
        return (totalXp - totalXpForLevel(level)).coerceAtLeast(0L).toInt()
    }

    fun rankForLevel(level: Int): Rank = when {
        level >= 50 -> Rank.S
        level >= 40 -> Rank.A
        level >= 30 -> Rank.B
        level >= 20 -> Rank.C
        level >= 10 -> Rank.D
        else -> Rank.E
    }
}
