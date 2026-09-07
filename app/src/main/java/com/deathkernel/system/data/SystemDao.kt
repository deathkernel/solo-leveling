package com.deathkernel.system.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface PlayerDao {
    @Query("SELECT * FROM player WHERE id = 1")
    fun observePlayer(): Flow<PlayerEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun savePlayer(player: PlayerEntity)
}

@Dao
interface WorkoutDao {
    @Query("SELECT * FROM workout_history ORDER BY completedAt DESC")
    fun observeHistory(): Flow<List<WorkoutEntity>>

    @Insert
    suspend fun insert(workout: WorkoutEntity)
}
