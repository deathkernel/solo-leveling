package com.deathkernel.system

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CutCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val SystemBackground = Color(0xFF05070B)
private val SystemPanel = Color(0xFF0A0F18)
private val SystemBlue = Color(0xFF69C8FF)
private val SystemText = Color(0xFFE9F6FF)
private val SystemMuted = Color(0xFF7893A5)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SystemApp() }
    }
}

@Composable
fun SystemApp() {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = SystemBackground) {
            SystemDashboard()
        }
    }
}

@Composable
private fun SystemDashboard() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SystemBackground)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = "SYSTEM",
            color = SystemBlue,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 4.sp
        )

        StatusPanel()
        QuestPanel()
    }
}

@Composable
private fun StatusPanel() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SystemPanel, CutCornerShape(2.dp))
            .padding(18.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("PLAYER STATUS", color = SystemMuted, fontSize = 11.sp, letterSpacing = 2.sp)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("RANK  E", color = SystemText, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text("LEVEL  01", color = SystemBlue, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
        Text("XP  0 / 1000", color = SystemText, fontSize = 12.sp)
        Text("STR  10     AGI  10     END  10     VIT  10     DIS  10", color = SystemMuted, fontSize = 10.sp)
    }
}

@Composable
private fun QuestPanel() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SystemPanel, CutCornerShape(2.dp))
            .padding(18.dp)
    ) {
        Text("DAILY QUEST", color = SystemBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
        Spacer(Modifier.height(14.dp))
        QuestRow("PUSH-UPS", "0 / 20")
        QuestRow("SQUATS", "0 / 25")
        QuestRow("CORE", "0 / 15")
        QuestRow("CARDIO", "0 / 15 MIN")
    }
}

@Composable
private fun QuestRow(name: String, progress: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 7.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text("◇  $name", color = SystemText, fontSize = 13.sp)
        Text(progress, color = SystemMuted, fontSize = 12.sp)
    }
}
