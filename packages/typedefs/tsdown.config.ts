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
});
