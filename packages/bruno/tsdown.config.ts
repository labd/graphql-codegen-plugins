import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	publint: true,
	failOnWarn: true,
	// TypeScript 7 is used on purpose; its "experimental API" notice is not actionable
	suppressWarnings: ["TypeScript 7.0 does not yet have a stable API"],
	clean: true,
	dts: true,
	sourcemap: true,
	format: ["esm"],
	outDir: "dist",
	fixedExtension: false,
	outputOptions: { codeSplitting: false },
	// prettier is a devDependency and intentionally bundled (same as with tsup)
	deps: { onlyBundle: ["prettier"] },
});
