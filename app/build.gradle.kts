plugins {
    kotlin("jvm") version "2.2.0"
    application
}

application {
    mainClass.set("com.sallie.app.MainKt")
}

dependencies {
    implementation(kotlin("stdlib"))
}

tasks.test {
    useJUnitPlatform()
}
