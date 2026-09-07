package com.deathkernel.system.data

import android.content.Context
import androidx.room.Database
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Room
import androidx.room.RoomDatabase

@Entity(tableName = "player")
data class PlayerEntity(
    @PrimaryKey val id: Int = 1,
    val name: String = "PLAYER",
    val rank: String = "E",
    val level: Int = 1,
    val xp: Int = 0,
    val strength: Int = 10,
    val agility: Int = 10,
    val endurance: Int = 10,
    val vitality: Int = 10,
    val discipline: Int = 10,
    val streak: Int = 0
)

@Entity(tableName = "workout_history")
data class WorkoutEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val exercise: String,
    val amount: Int,
    val unit: String,
    val completedAt: Long
)

@Database(
    entities = [PlayerEntity::class, WorkoutEntity::class],
    version = 1,
    exportSchema = true
)
abstract class SystemDatabase : RoomDatabase() {
    abstract fun playerDao(): PlayerDao
    abstract fun workoutDao(): WorkoutDao

    companion object {
        @Volatile private var INSTANCE: SystemDatabase? = null

        fun get(context: Context): SystemDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    SystemDatabase::class.java,
                    "system.db"
                ).build().also { INSTANCE = it }
            }
    }
}
