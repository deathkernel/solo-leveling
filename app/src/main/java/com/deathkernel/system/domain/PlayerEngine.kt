package com.deathkernel.system.domain

import com.deathkernel.system.data.PlayerDao
import com.deathkernel.system.data.PlayerEntity

class PlayerEngine(private val playerDao: PlayerDao) {

    suspend fun ensurePlayer(): PlayerEntity {
        val existing = playerDao.getPlayer()
        if (existing != null) return existing
        val player = PlayerEntity()
        playerDao.savePlayer(player)
        return player
    }

    suspend fun addXp(amount: Int): PlayerProgress {
        require(amount >= 0) { "XP amount cannot be negative." }
        val player = ensurePlayer()
        val totalXp = Progression.totalXpForLevel(player.level) + player.xp + amount
        val level = Progression.levelForTotalXp(totalXp)
        val rank = Progression.rankForLevel(level)
        val updated = player.copy(
            level = level,
            xp = Progression.xpIntoCurrentLevel(totalXp),
            rank = rank.name
        )
        playerDao.savePlayer(updated)
        return PlayerProgress.from(updated)
    }

    suspend fun removeXp(amount: Int): PlayerProgress {
        require(amount >= 0) { "XP amount cannot be negative." }
        val player = ensurePlayer()
        val currentTotalXp = Progression.totalXpForLevel(player.level) + player.xp
        val totalXp = (currentTotalXp - amount).coerceAtLeast(0L)
        val level = Progression.levelForTotalXp(totalXp)
        val rank = Progression.rankForLevel(level)
        val updated = player.copy(
            level = level,
            xp = Progression.xpIntoCurrentLevel(totalXp),
            rank = rank.name
        )
        playerDao.savePlayer(updated)
        return PlayerProgress.from(updated)
    }
}
