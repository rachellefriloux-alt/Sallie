/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Project settings and module inclusion.
 * Got it, love.
 */

// Explicit settings for Sallie multi-module workspace
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    plugins {
        kotlin("jvm") version "2.2.0"
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.8.0"
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "sallie_1.0"

// Core modules
include(":app")
include(":ai")
include(":core")
include(":feature")
include(":components")
include(":identity")
include(":onboarding")
include(":personaCore")
include(":responseTemplates")
include(":tone")
include(":ui")
include(":values")
