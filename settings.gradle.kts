pluginManagement {
  repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
  }
}

dependencyResolutionManagement {
  repositories {
    google()
    mavenCentral()
  }
}

<<<<<<< HEAD
rootProject.name = "Sallie"
include(":app")
=======
rootProject.name = "sallie_1.0"

// Specify Gradle version for wrapper (latest stable)
// Uncomment and run './gradlew wrapper --gradle-version=8.7' if wrapper is present

// Core modules
// include(":app")  // Temporarily disabled to fix Kotlin modules first
include(":ai")
include(":core")
include(":feature")
// include(":components")  // Temporarily disabled - has Android dependencies
include(":identity")
include(":onboarding")
include(":personaCore")
include(":responseTemplates")
include(":tone")
// include(":ui")  // Temporarily disabled - has Android dependencies
include(":values")
>>>>>>> Sallie
