import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
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
