plugins {
  id("com.android.application") version "8.12.1" apply false
  kotlin("android") version "2.2.0" apply false
}

allprojects {
  repositories {
    google()
    mavenCentral()
  }
}
