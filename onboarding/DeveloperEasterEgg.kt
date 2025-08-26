package onboarding

import android.util.Log
import com.yourorg.sallie.BuildConfig

object DeveloperEasterEgg {
    fun drop(userId: String) {
        if (BuildConfig.DEBUG && userId == "Rachelle") {
            Log.d("Sallie", "🛠 You see more than they do — here’s the raw persona graph…")
            // TODO: Dump persona state for inspection
        }
    }
}
