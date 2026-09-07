package com.deathkernel.system.domain

import com.deathkernel.system.data.PlayerEntity

data class PlayerProgress(
    val player: PlayerEntity,
    val totalXp: Long,
    val currentLevelXp: Int,
    val nextLevelXp: Int,
    val calculatedRank: Rank
) {
    val levelProgress: Float
        get() = if (nextLevelXp <= 0) 0f else (currentLevelXp.toFloat() / nextLevelXp).coerceIn(0f, 1f)

    val rankProgress: Float
        get() {
            if (calculatedRank == Rank.S) return 1f
            val currentRankLevel = rankMinimumLevel(calculatedRank)
            val nextRankLevel = rankMinimumLevel(Rank.entries[calculatedRank.order + 1])
            return ((player.level - currentRankLevel).toFloat() / (nextRankLevel - currentRankLevel))
                .coerceIn(0f, 1f)
        }

    companion object {
        fun from(player: PlayerEntity): PlayerProgress {
            val totalXp = Progression.totalXpForLevel(player.level) + player.xp.coerceAtLeast(0)
            val level = Progression.levelForTotalXp(totalXp)
            val normalizedPlayer = if (level != player.level) {
                player.copy(
                    level = level,
                    xp = Progression.xpIntoCurrentLevel(totalXp)
                )
            } else player

            return PlayerProgress(
                player = normalizedPlayer,
                totalXp = totalXp,
                currentLevelXp = Progression.xpIntoCurrentLevel(totalXp),
                nextLevelXp = Progression.xpForNextLevel(level),
                calculatedRank = Progression.rankForLevel(level)
            )
        }

        private fun rankMinimumLevel(rank: Rank): Int = when (rank) {
            Rank.E -> 1
            Rank.D -> 10
            Rank.C -> 20
            Rank.B -> 30
            Rank.A -> 40
            Rank.S -> 50
        }
    }
}
