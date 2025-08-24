

// Sallie 1.0 Module - Universal Verification Task

tasks.register("verifyAllModules") {
	group = "verification"
	description = "Builds and tests all Sallie modules."
	dependsOn(gradle.includedBuilds.map { it.task("build") })
	doLast {
		println("All modules built and tested successfully.")
	}
}
