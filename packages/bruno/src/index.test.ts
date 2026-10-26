import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Types } from "@graphql-codegen/plugin-helpers";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadDocumentsSync, loadSchemaSync } from "@graphql-tools/load";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BrunoPluginConfig } from "./bruno";
import { plugin } from "./index";

const snapshotDir = path.join(__dirname, "__snapshots__");
const mocksDir = path.join(__dirname, "__mocks__");

const schema = loadSchemaSync(path.join(mocksDir, "schema.graphqls"), {
	loaders: [new GraphQLFileLoader()],
});
const documents = loadDocumentsSync(
	[
		path.join(mocksDir, "query.graphql"),
		path.join(mocksDir, "operations.graphql"),
	],
	{ loaders: [new GraphQLFileLoader()] },
) as Types.DocumentFile[];

const defaultConfig: BrunoPluginConfig = {
	defaults: {},
	headers: {},
	clean: false,
};

/** Lists the files in a directory, recursively, as sorted relative paths. */
const listFiles = (dir: string): string[] =>
	(fs.readdirSync(dir, { recursive: true, withFileTypes: true }) as fs.Dirent[])
		.filter((entry) => entry.isFile())
		.map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
		.sort();

describe("Bruno Plugin", () => {
	let collectionDir: string;
	let outputDir: string;
	let outputFile: string;

	beforeEach(() => {
		collectionDir = fs.mkdtempSync(path.join(os.tmpdir(), "codegen-bruno-"));
		outputDir = path.join(collectionDir, "generated");
		outputFile = path.join(outputDir, "index.json");
	});

	afterEach(() => {
		fs.rmSync(collectionDir, { recursive: true, force: true });
	});

	const read = (file: string) =>
		fs.readFileSync(path.join(outputDir, file), "utf-8");

	it("should generate the expected output", async () => {
		const data = await plugin(schema, documents, defaultConfig, {
			outputFile,
		});

		const index: Record<string, { filename: string; source: string }> =
			JSON.parse(data as string);
		const resolved = Object.fromEntries(
			Object.entries(index).map(([name, { filename, source }]) => [
				name,
				{ filename, source: path.resolve(outputDir, source) },
			]),
		);
		expect(resolved).toEqual({
			CustomerUpdated: {
				filename: "CustomerUpdated.bru",
				source: path.join(mocksDir, "operations.graphql"),
			},
			GetCustomer: {
				filename: "GetCustomer.bru",
				source: path.join(mocksDir, "query.graphql"),
			},
			GetProduct: {
				filename: "GetProduct.bru",
				source: path.join(mocksDir, "operations.graphql"),
			},
			UpdateCustomer: {
				filename: "UpdateCustomer.bru",
				source: path.join(mocksDir, "operations.graphql"),
			},
		});
		expect(listFiles(outputDir)).toEqual([
			path.join("mutations", "UpdateCustomer.bru"),
			path.join("queries", "GetCustomer.bru"),
			path.join("queries", "GetProduct.bru"),
			path.join("subscriptions", "CustomerUpdated.bru"),
		]);

		for (const file of listFiles(outputDir)) {
			await expect(read(file)).toMatchFileSnapshot(
				path.join(snapshotDir, file),
			);
		}
	});

	it("only includes the operation and the fragments it uses, once", async () => {
		await plugin(schema, documents, defaultConfig, { outputFile });

		const getCustomer = read(path.join("queries", "GetCustomer.bru"));
		expect(getCustomer.match(/fragment CustomerDetails/g)).toHaveLength(1);
		expect(getCustomer.match(/fragment AddressDetails/g)).toHaveLength(1);

		const getProduct = read(path.join("queries", "GetProduct.bru"));
		expect(getProduct).toContain("query GetProduct");
		expect(getProduct).toContain("fragment ProductFields");
		expect(getProduct).not.toContain("UpdateCustomer");
		expect(getProduct).not.toContain("CustomerUpdated");
		expect(getProduct).not.toContain("UnusedFields");
		expect(getProduct).not.toContain("# Several operations");

		// Fragments from another document, used via an inline fragment
		const customerUpdated = read(
			path.join("subscriptions", "CustomerUpdated.bru"),
		);
		expect(customerUpdated).toContain("fragment CustomerDetails");
		expect(customerUpdated).toContain("fragment AddressDetails");
	});

	it("uses the configured url, auth and headers", async () => {
		await plugin(
			schema,
			documents,
			{
				...defaultConfig,
				url: "{{baseUrl}}/api/graphql",
				auth: "inherit",
				headers: { Authorization: "Bearer {{token}}" },
				defaults: { id: "product-1" },
			},
			{ outputFile },
		);

		const getProduct = read(path.join("queries", "GetProduct.bru"));
		expect(getProduct).toContain(
			[
				"post {",
				"  url: {{baseUrl}}/api/graphql",
				"  body: graphql",
				"  auth: inherit",
				"}",
				"",
				"headers {",
				"  Authorization: Bearer {{token}}",
				"}",
			].join("\n"),
		);
		expect(getProduct).toContain('"id": "product-1"');
	});

	describe("clean", () => {
		const writeFile = (file: string, content = "") => {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.writeFileSync(file, content);
		};

		it("only removes previously generated requests", async () => {
			// The collection, with the generated requests in its root
			outputFile = path.join(collectionDir, "index.json");
			outputDir = collectionDir;
			writeFile(path.join(collectionDir, "bruno.json"), "{}");
			writeFile(path.join(collectionDir, "collection.bru"));
			writeFile(path.join(collectionDir, "environments", "local.bru"));
			writeFile(path.join(collectionDir, "custom", "Custom.bru"));
			writeFile(path.join(collectionDir, "queries", "folder.bru"));
			writeFile(path.join(collectionDir, "queries", "notes.md"));
			// Generated by a previous run, for operations that no longer exist
			writeFile(path.join(collectionDir, "queries", "Removed.bru"));
			writeFile(path.join(collectionDir, "mutations", "Removed.bru"));
			writeFile(path.join(collectionDir, "subscriptions", "Removed.bru"));

			await plugin(
				schema,
				documents,
				{ ...defaultConfig, clean: true },
				{ outputFile },
			);

			expect(listFiles(collectionDir)).toEqual([
				"bruno.json",
				"collection.bru",
				path.join("custom", "Custom.bru"),
				path.join("environments", "local.bru"),
				path.join("mutations", "UpdateCustomer.bru"),
				path.join("queries", "GetCustomer.bru"),
				path.join("queries", "GetProduct.bru"),
				path.join("queries", "folder.bru"),
				path.join("queries", "notes.md"),
				path.join("subscriptions", "CustomerUpdated.bru"),
			]);
		});

		it("removes folders that are empty afterwards", async () => {
			writeFile(path.join(outputDir, "queries", "Removed.bru"));

			await plugin(
				schema,
				[documents[1]],
				{ ...defaultConfig, clean: true },
				{ outputFile },
			);
			await plugin(
				schema,
				[],
				{ ...defaultConfig, clean: true },
				{ outputFile },
			);

			expect(fs.readdirSync(outputDir)).toEqual([]);
		});

		it("keeps everything when clean is not enabled", async () => {
			writeFile(path.join(outputDir, "queries", "Removed.bru"));

			await plugin(schema, documents, defaultConfig, { outputFile });

			expect(listFiles(outputDir)).toContain(
				path.join("queries", "Removed.bru"),
			);
		});
	});
});
