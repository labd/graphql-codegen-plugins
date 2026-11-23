import {
	type BrunoPluginConfig,
	DEFAULT_AUTH,
	DEFAULT_URL,
	mergeDefaults,
} from "./bruno";
import type { FileContent } from "./operations";

/**
 * Renders an operation as an OpenCollection (YAML) request, the format of a
 * Bruno collection with an `opencollection.yml` in its root. Such a collection
 * does not load `.bru` files.
 */
export const asOpenCollection = (
	operation: FileContent,
	config: BrunoPluginConfig,
	seq: number,
): string => {
	const vars = mergeDefaults(operation.vars, config.defaults ?? {});
	const lines: string[] = [
		"info:",
		`  name: ${scalar(operation.name)}`,
		"  type: graphql",
		`  seq: ${seq}`,
		"",
		"graphql:",
		"  method: POST",
		`  url: ${scalar(config.url ?? DEFAULT_URL)}`,
	];

	const headers = Object.entries(config.headers ?? {});
	if (headers.length > 0) {
		lines.push("  headers:");
		for (const [name, value] of headers) {
			lines.push(
				`    - name: ${scalar(name)}`,
				`      value: ${scalar(value)}`,
			);
		}
	}

	lines.push(
		"  body:",
		"    query: |-",
		...block(operation.content, 6),
		"    variables: |-",
		...block(JSON.stringify(vars, null, 2), 6),
	);
	lines.push(...auth(config.auth ?? DEFAULT_AUTH));

	return `${lines.join("\n")}\n`;
};

/**
 * `none` is the absence of auth, so it is left out; `inherit` is a value of its
 * own; any other mode becomes `{ type: <mode> }`.
 */
const auth = (mode: string): string[] => {
	if (mode === "none") {
		return [];
	}
	if (mode === "inherit") {
		return ["  auth: inherit"];
	}
	return ["  auth:", `    type: ${scalar(mode)}`];
};

/** A JSON string is a valid YAML double-quoted scalar, so any value is safe. */
const scalar = (value: string): string => JSON.stringify(value);

/** The lines of a block scalar; empty lines stay empty, without indentation. */
const block = (text: string, indent: number): string[] =>
	text
		.split("\n")
		.map((line) => (line.trim() === "" ? "" : `${" ".repeat(indent)}${line}`));
