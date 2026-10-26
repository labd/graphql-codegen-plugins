import type { FileContent } from "./operations";

export const DEFAULT_URL = "{{graphql-gateway}}/graphql";
export const DEFAULT_AUTH = "none";

export interface BrunoPluginConfig {
	/**
	 * Values for operation variables, by variable name. Replaces the generated
	 * example value of a top-level variable with the same name.
	 */
	defaults?: Record<string, unknown>;
	/** Headers added to every request. */
	headers?: Record<string, string>;
	/**
	 * Remove the previously generated requests (the `.bru` files in the
	 * `queries/`, `mutations/` and `subscriptions/` folders of the output
	 * directory) before generating.
	 */
	clean?: boolean;
	/** URL of the requests. Defaults to `{{graphql-gateway}}/graphql`. */
	url?: string;
	/**
	 * Auth mode of the requests, for example `inherit` to use the auth of the
	 * collection. Defaults to `none`.
	 */
	auth?: string;
}

export const asBruno = (
	operation: FileContent,
	config: BrunoPluginConfig,
): string => {
	const vars = mergeDefaults(operation.vars, config.defaults ?? {});

	const file = new FileCreator();
	file.addElement("meta", [`name: ${operation.name}`, "type: graphql"]);
	file.addElement("post", [
		`url: ${config.url ?? DEFAULT_URL}`,
		"body: graphql",
		`auth: ${config.auth ?? DEFAULT_AUTH}`,
	]);
	file.addElement(
		"headers",
		Object.entries(config.headers ?? {}).map(
			([key, value]) => `${key}: ${value}`,
		),
	);

	file.addElement("body:graphql", operation.content.split("\n"));

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
