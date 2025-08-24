/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Root build configuration for modular Android launcher.
 * Got it, love.
 */
buildscript {
}

// Top-level build file for Sallie 1.0
// Root build: alignment, verification, coverage, formatting – privacy-first (no new network code)
plugins {
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1" apply false
    id("io.gitlab.arturbosch.detekt") version "1.23.1" apply false
    jacoco
    kotlin("jvm")
}

val coverageMin: String = providers.environmentVariable("COVERAGE_MIN")
    .orElse(providers.gradleProperty("coverageMin"))
    .orElse("0.30")
    .get()
extensions.extraProperties["coverageMin"] = coverageMin

// Ensure a single aggregate check

// Apply verification to root project
apply(from = "verification.gradle.kts")

subprojects {
    plugins.withId("org.jetbrains.kotlin.jvm") {
        apply(plugin = "org.jlleitschuh.gradle.ktlint")
        apply(plugin = "io.gitlab.arturbosch.detekt")
        apply(plugin = "jacoco")
        tasks.withType<Test>().configureEach { useJUnitPlatform() }
        if (tasks.findByName("jacocoTestReport") == null) {
            tasks.register<JacocoReport>("jacocoTestReport") {
                dependsOn(tasks.withType<Test>())
                reports { xml.required.set(true); html.required.set(true) }
                val classesDir = fileTree(layout.buildDirectory.dir("classes/kotlin/main"))
                classDirectories.setFrom(classesDir)
                sourceDirectories.setFrom(files("src/main/kotlin"))
            }
        }
        extensions.configure<io.gitlab.arturbosch.detekt.extensions.DetektExtension> {
            config = files("${rootProject.projectDir}/detekt.yml")
            buildUponDefaultConfig = true
            allRules = false
        }
        kotlin {
            jvmToolchain(21)
        }
        tasks.withType<JavaCompile>().configureEach {
            options.release.set(21)
        }
    }
}
dependencies {
    implementation(kotlin("stdlib-jdk8"))
}
kotlin {
    jvmToolchain(8)
}