import { defineConfig } from "vitest/config";

export default defineConfig({
	// graphql 17 exposes a separate "development" build; make sure the test
	// files and the (externalized) graphql-tools loaders share one instance.
	ssr: {
		resolve: {
			conditions: ["module-sync", "node", "import", "default"],
			externalConditions: ["module-sync", "node"],
		},
	},
	test: {
		testTimeout: 5000,
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
		},
		passWithNoTests: true,
		server: {
			deps: {
				fallbackCJS: true,
			},
		},
	},
});
