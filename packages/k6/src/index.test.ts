import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { plugin as typescriptOperationsPlugin } from "@graphql-codegen/typescript-operations";
import { DocumentMode } from "@graphql-codegen/visitor-plugin-common";
import { buildSchema, parse } from "graphql";
import { afterAll, describe, expect, it } from "vitest";
import type { RawK6PluginConfig } from "./config";
import { plugin } from "./index";

const packageDir = path.join(__dirname, "..");
const mocksDir = path.join(__dirname, "__mocks__");
// Inside the package so that the fixture resolves `graphql`, `graphql-tag`
// and `@types/k6` from its node_modules (ignored by git).
const typecheckDir = path.join(packageDir, ".typecheck");

const schema = buildSchema(
	fs.readFileSync(path.join(mocksDir, "schema.graphqls"), "utf-8"),
);
const documents: Types.DocumentFile[] = [
	{
		location: path.join(mocksDir, "operations.graphql"),
		document: parse(
			fs.readFileSync(path.join(mocksDir, "operations.graphql"), "utf-8"),
		),
	},
];

const outputToString = (output: Types.PluginOutput): string => {
	if (typeof output === "string") {
		return output;
	}
	return [...(output.prepend ?? []), output.content, ...(output.append ?? [])]
		.filter(Boolean)
		.join("\n");
};

const generateK6 = async (config: RawK6PluginConfig) =>
	outputToString(
		await plugin(schema, documents, config, { outputFile: "sdk.ts" }),
	);

/** The output of `typescript-operations` followed by the k6 plugin. */
const generateSdk = async (config: RawK6PluginConfig) => {
	const operations = outputToString(
		await typescriptOperationsPlugin(schema, documents, config, {
			outputFile: "sdk.ts",
		}),
	);
	return `${operations}\n${await generateK6(config)}`;
};

const tsconfig = {
	compilerOptions: {
		target: "ES2022",
		lib: ["ES2022"],
		module: "ESNext",
		moduleResolution: "bundler",
		strict: true,
		noEmit: true,
		skipLibCheck: true,
		types: ["k6"],
	},
	include: ["*.ts"],
};

const documentNodeUsage = `
import { print } from "graphql";
import http, { type Params } from "k6/http";
import { getSdk } from "./sdk";

const sdk = getSdk<Params, unknown>((doc, variables, options) =>
	http.post("http://localhost/graphql", JSON.stringify({ query: print(doc), variables }), options),
);
`;

const stringUsage = `
import http, { type Params } from "k6/http";
import { getSdk } from "./sdk";

const sdk = getSdk<Params, unknown>((doc, variables, options) =>
	http.post("http://localhost/graphql", JSON.stringify({ query: doc, variables }), options),
);
`;

const sdkCalls = `
export default function () {
	sdk.GetProduct({ id: "1", locale: "NL" }, { tags: { name: "GetProduct" } });
	sdk.ListProducts();
	sdk.ListProducts({ filter: { query: "shoe" } });
	sdk.AddToCart({ productId: "1", quantity: 2 });
	sdk.CartUpdated({ cartId: "1" });
	// @ts-expect-error required variables are missing
	sdk.GetProduct();
	// @ts-expect-error unknown enum value
	sdk.GetProduct({ id: "1", locale: "DE" });
}
`;

const typecheck = (name: string, files: Record<string, string>) => {
	const dir = path.join(typecheckDir, name);
	fs.rmSync(dir, { recursive: true, force: true });
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(path.join(dir, "tsconfig.json"), JSON.stringify(tsconfig));
	for (const [file, content] of Object.entries(files)) {
		fs.writeFileSync(path.join(dir, file), content);
	}
	try {
		execFileSync(
			path.join(packageDir, "node_modules", ".bin", "tsc"),
			["-p", dir],
			{ encoding: "utf-8", stdio: "pipe" },
		);
	} catch (error) {
		const { stdout, stderr } = error as { stdout: string; stderr: string };
		throw new Error(`Type check of ${name} failed:\n${stdout}${stderr}`);
	}
};

afterAll(() => {
	fs.rmSync(typecheckDir, { recursive: true, force: true });
});

describe("k6 plugin", () => {
	describe.each([
		{ documentMode: DocumentMode.graphQLTag, useTypeImports: false },
		{ documentMode: DocumentMode.graphQLTag, useTypeImports: true },
		{ documentMode: DocumentMode.documentNode, useTypeImports: false },
		{
			documentMode: DocumentMode.documentNodeImportFragments,
			useTypeImports: false,
		},
	])(
		"documentMode $documentMode (useTypeImports: $useTypeImports)",
		(config) => {
			it("generates the sdk", async () => {
				const output = await generateK6(config);
				expect(output).toMatchSnapshot();

				const documentNodeImport = config.useTypeImports
					? "import type { DocumentNode } from 'graphql';"
					: "import { DocumentNode } from 'graphql';";
				expect(
					output.split("\n").filter((line) => line === documentNodeImport),
				).toHaveLength(1);
				expect(output).toContain("(doc: DocumentNode, vars?: V");
			});

			it("type checks", { timeout: 30_000 }, async () => {
				const name = `${config.documentMode}${config.useTypeImports ? "-type-imports" : ""}`;
				typecheck(name, {
					"sdk.ts": await generateSdk(config),
					"script.ts": documentNodeUsage + sdkCalls,
				});
			});
		},
	);

	describe("documentMode string", () => {
		const config = { documentMode: DocumentMode.string };

		it("generates the sdk", async () => {
			const output = await generateK6(config);
			expect(output).toMatchSnapshot();

			expect(output).toContain(
				"export class TypedDocumentString<TResult, TVariables> extends String",
			);
			expect(output).toContain(
				"as unknown as TypedDocumentString<GetProductQuery, GetProductQueryVariables>;",
			);
			expect(output).toContain("(doc: TypedDocumentString<R, V>, vars?: V");
			expect(output).not.toContain("DocumentNode");
		});

		it("type checks", { timeout: 30_000 }, async () => {
			typecheck("string", {
				"sdk.ts": await generateSdk(config),
				"script.ts": stringUsage + sdkCalls,
			});
		});

		it("serializes the document as the query string", async () => {
			const output = await generateK6(config);
			const source = output.slice(
				output.indexOf("export class TypedDocumentString"),
				output.indexOf("export const"),
			);
			// Let vite transpile the generated class and evaluate it
			const dir = path.join(typecheckDir, "runtime");
			fs.mkdirSync(dir, { recursive: true });
			const file = path.join(dir, "typed-document-string.ts");
			fs.writeFileSync(file, source);
			const { TypedDocumentString } = await import(file);
			const doc = new TypedDocumentString("query A { a }");
			expect(JSON.stringify({ query: doc })).toBe('{"query":"query A { a }"}');
			expect(String(doc)).toBe("query A { a }");
		});
	});

	describe("documentMode external", () => {
		const config = {
			documentMode: DocumentMode.external,
			importDocumentNodeExternallyFrom: "./operations",
		};

		it("generates the sdk", async () => {
			const output = await generateK6(config);
			expect(output).toMatchSnapshot();
			expect(output).toContain("import * as Operations from './operations';");
			expect(output).toContain("import { DocumentNode } from 'graphql';");
		});

		it("type checks", { timeout: 30_000 }, async () => {
			typecheck("external", {
				"operations.ts": await generateSdk({
					documentMode: DocumentMode.documentNode,
				}),
				"sdk.ts": await generateSdk(config),
				"script.ts": documentNodeUsage + sdkCalls,
			});
		});
	});

	it("only generates documents and the sdk, no schema types", async () => {
		// typescript-operations v6 generates the enum and input types it needs;
		// the k6 plugin must not declare any of them (again).
		const output = await generateK6({});
		const declarations = [
			...output.matchAll(
				/^\s*export (?:type|enum|const|class|function) (\w+)/gm,
			),
		].map((match) => match[1]);
		expect(declarations).toEqual([
			"ProductPriceFragmentDoc",
			"ProductFieldsFragmentDoc",
			"GetProductDocument",
			"ListProductsDocument",
			"AddToCartDocument",
			"CartUpdatedDocument",
			"Requester",
			"getSdk",
			"Sdk",
		]);
	});

	it("rejects unnamed operations", async () => {
		expect(() =>
			plugin(
				schema,
				[
					{
						location: "anonymous.graphql",
						document: parse("{ products { id } }"),
					},
				],
				{},
				{ outputFile: "sdk.ts" },
			),
		).toThrow(/cannot generate SDK for unnamed operation/);
	});
});
