import prettier from "prettier";
import type { FileContent } from "./operations";

export interface BrunoPluginConfig {
	defaults: Record<string, unknown>;
	headers: Record<string, string>;
	clean: boolean;
}

export const asBruno = async (
	operation: FileContent,
	config: BrunoPluginConfig,
) => {
	const formattedContent = await prettier.format(operation.content, {
		parser: "graphql",
	});

	const vars = mergeDefaults(operation.vars, config.defaults);

	const file = new FileCreator();
	file.addElement("meta", [`name: ${operation.name}`, "type: graphql"]);
	file.addElement("post", [
		"url: {{graphql-gateway}}/graphql",
		"body: graphql",
		"auth: none",
	]);
	file.addElement(
		"headers",
		Object.entries(config.headers ?? {}).map(
			([key, value]) => `${key}: "${value}"`,
		),
	);

	file.addElement("body:graphql", formattedContent.split("\n"));

	file.addElement(
		"body:graphql:vars",
		JSON.stringify(vars, null, 2).split("\n"),
	);

	return file.toString();
};

const mergeDefaults = (
	vars: Record<string, unknown>,
	defaults: Record<string, unknown>,
) => {
	const mergedVars: Record<string, unknown> = {};

	for (const key in vars) {
		mergedVars[key] = vars[key];
	}

	for (const key in defaults) {
		if (key in vars) {
			mergedVars[key] = defaults[key];
		}
	}

	return mergedVars;
};

class FileCreator {
	elements: string[];

	constructor() {
		this.elements = [];
	}

	addElement(name: string, lines: string[]) {
		if (lines.length === 0) {
			return;
		}
		const snippet: string[] = [];
		snippet.push(`${name} {`);

		for (const line of lines) {
			snippet.push(`  ${line}`);
		}
		snippet.push("}");
		this.elements.push(snippet.join("\n"));
	}

	toString() {
		return this.elements.join("\n\n");
	}
}
