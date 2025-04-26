import nodeFs from "node:fs";
import path from "node:path";
import type { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import type { GraphQLSchema } from "graphql";
import { type BrunoPluginConfig, asBruno } from "./bruno";
import { extractOperations } from "./operations";

export const plugin: PluginFunction<BrunoPluginConfig> = async (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
	config,
	info,
): Promise<string> => {
	if (!info?.outputFile) {
		throw new Error("Output directory not provided");
	}
	const outputDir = path.dirname(info?.outputFile);
	if (config.clean) {
		emptyDirSync(outputDir);
	}

	const operations = extractOperations(schema, documents).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
	const result: Record<string, Record<string, string>> = {};
	for (const operation of operations) {
		const subpath = operation.kind === "query" ? "queries" : "mutations";
		const fileName = `${operation.name}.bru`;
		const outputPath = path.join(outputDir, subpath, fileName);

		const formattedContent = await asBruno(operation, config);

		outputFileSync(outputPath, formattedContent);
		result[operation.name] = {
			filename: fileName,
			source: operation.location
				? path.relative(outputDir, operation.location)
				: "(unknown)",
		};
	}
	return JSON.stringify(result, null, 2);
};

function emptyDirSync(dirPath: string): void {
	if (!nodeFs.existsSync(dirPath)) {
		nodeFs.mkdirSync(dirPath, { recursive: true });
		return;
	}

	const files = nodeFs.readdirSync(dirPath);
	for (const file of files) {
		const filePath = path.join(dirPath, file);
		nodeFs.rmSync(filePath, { recursive: true, force: true });
	}
}

function outputFileSync(filePath: string, content: string): void {
	const dirPath = path.dirname(filePath);
	if (!nodeFs.existsSync(dirPath)) {
		nodeFs.mkdirSync(dirPath, { recursive: true });
	}
	nodeFs.writeFileSync(filePath, content);
}
