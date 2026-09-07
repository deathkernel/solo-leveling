package com.deathkernel.system.domain

/** The six player ranks. S is the endgame / Monarch-tier rank. */
enum class Rank(val order: Int) {
    E(0), D(1), C(2), B(3), A(4), S(5);

    companion object {
        fun from(value: String): Rank = entries.firstOrNull { it.name == value } ?: E
    }
}
