# @labdigital/graphql-codegen-k6

[![npm](https://img.shields.io/npm/v/@labdigital/graphql-codegen-k6)](https://www.npmjs.com/package/@labdigital/graphql-codegen-k6)

A [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that
generates a typed SDK for your GraphQL operations, to use in
[k6](https://k6.io) load tests.

The SDK has a method per named operation that takes typed variables and
returns the k6 `RefinedResponse`, so load test scripts can reuse the operations
of your application instead of copy-pasted query strings.

This plugin is a fork of the
[`typescript-generic-sdk`](https://github.com/dotansimha/graphql-code-generator-community/tree/main/packages/plugins/typescript/generic-sdk)
plugin, adapted to the k6 HTTP API.

## Installation

```sh
pnpm add -D @labdigital/graphql-codegen-k6 @graphql-codegen/cli @graphql-codegen/typescript-operations graphql graphql-tag
pnpm add -D @types/k6
```

`graphql` and `graphql-tag` are peer dependencies. The plugin only generates
the operation documents and the SDK methods; the operation types it refers to
come from `@graphql-codegen/typescript-operations`.

Use `typescript-operations` (v6) on its own, **without** the `typescript`
plugin in the same output: `typescript-operations` v6 generates the enum and
input types the operations need itself, so adding `typescript` results in
duplicate declarations of those types. This plugin does not generate any schema
types.

## Usage

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "schema.graphql",
	documents: ["src/**/*.graphql"],
	generates: {
		"k6/sdk.ts": {
			plugins: ["typescript-operations", "@labdigital/graphql-codegen-k6"],
			config: {
				// Embed the operations as DocumentNode objects (the default,
				// "graphQLTag", uses gql from graphql-tag)
				documentMode: "documentNode",
				useTypeImports: true,
			},
		},
	},
};

export default config;
```

```sh
pnpm graphql-codegen --config codegen.ts
```

`getSdk()` takes a *requester*: a function that receives the operation, its
variables and your options, and performs the HTTP request with k6:

```ts
import { check } from "k6";
import http, { type Params } from "k6/http";
import { type DocumentNode, print } from "graphql";
import { getSdk } from "./sdk";

const endpoint = __ENV.GRAPHQL_ENDPOINT ?? "http://localhost:4000/graphql";

const sdk = getSdk<Params, unknown>((doc: DocumentNode, variables, options) =>
	http.post(
		endpoint,
		JSON.stringify({ query: print(doc), variables }),
		{
			...options,
			headers: { "Content-Type": "application/json", ...options?.headers },
		},
	),
);

export default function () {
	const res = sdk.GetProduct({ id: "123" });
	check(res, {
		"status is 200": (r) => r.status === 200,
		"no errors": (r) => !r.json("errors"),
	});
}
```

The second argument of every SDK method is passed to the requester as
`options`, so you can, for example, set tags or headers per request:
`sdk.GetProduct({ id: "123" }, { tags: { name: "GetProduct" } })`.

k6 does not resolve npm packages, so bundle the script (and `graphql`) before
running it, with any bundler that keeps the `k6` and `k6/*` imports external,
for example esbuild:

```sh
esbuild k6/script.ts --bundle --format=esm --external:k6 --external:'k6/*' --outfile=dist/script.js
k6 run dist/script.js
```

## Configuration

The plugin accepts the configuration of the client-side plugins of GraphQL
Code Generator (`RawClientSideBasePluginConfig` from
[`@graphql-codegen/visitor-plugin-common`](https://github.com/dotansimha/graphql-code-generator/tree/master/packages/plugins/other/visitor-plugin-common)).
The options that affect the generated SDK:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `documentMode` | `"graphQLTag" \| "documentNode" \| "documentNodeImportFragments" \| "external" \| "string"` | `"graphQLTag"` | How the operation documents are emitted. `graphQLTag` uses `gql` from `graphql-tag`, `documentNode` embeds them as plain `DocumentNode` objects, `external` imports them from `importDocumentNodeExternallyFrom`, `string` emits them as `TypedDocumentString` (see [String documents](#string-documents)). |
| `importDocumentNodeExternallyFrom` | `string` | `""` | Module to import the documents from when `documentMode` is `external`. The SDK then refers to them as `Operations.<name>Document`. |
| `importOperationTypesFrom` | `string` | `""` | Namespace prefix for the operation result and variables types used in the SDK (for example `Types` results in `Types.GetProductQuery`). Used by presets such as `near-operation-file`. |
| `gqlImport` | `string` | `"graphql-tag#gql"` | Module (and export) to import `gql` from, when `documentMode` is `graphQLTag`. |
| `documentNodeImport` | `string` | `"graphql#DocumentNode"` | Module (and export) to import the `DocumentNode` type from. |
| `useTypeImports` | `boolean` | `false` | Use `import type` for type-only imports, such as `DocumentNode`. |
| `noExport` | `boolean` | `false` | Generate the operation documents without `export`. |
| `documentVariablePrefix` | `string` | `""` | Prefix for the names of the generated operation documents. |
| `documentVariableSuffix` | `string` | `"Document"` | Suffix for the names of the generated operation documents. |
| `fragmentVariablePrefix` | `string` | `""` | Prefix for the names of the generated fragment documents. |
| `fragmentVariableSuffix` | `string` | `"FragmentDoc"` | Suffix for the names of the generated fragment documents. |
| `optimizeDocumentNode` | `boolean` | `true` | Apply document optimizations when `documentMode` is `documentNode` or `documentNodeImportFragments`. |
| `pureMagicComment` | `boolean` | `false` | Add a `/*#__PURE__*/` comment to the generated documents, for tree shaking. |
| `experimentalFragmentVariables` | `boolean` | `false` | Enable support for variables on fragments, when `documentMode` is `graphQLTag`. |
| `dedupeOperationSuffix` | `boolean` | `false` | Avoid duplicate operation suffixes in type names (for example `GetProductQueryQuery`). Use the same value as for `typescript-operations`. |
| `omitOperationSuffix` | `boolean` | `false` | Omit the `Query`/`Mutation`/`Subscription` suffix in type names. Use the same value as for `typescript-operations`. |
| `operationResultSuffix` | `string` | `""` | Suffix for the operation result type names. Use the same value as for `typescript-operations`. |
| `namingConvention` | `NamingConvention` | `"change-case-all#pascalCase"` | Naming convention for the generated names. Use the same value as for `typescript-operations`. |
| `typesPrefix` | `string` | `""` | Prefix for the referenced type names. Use the same value as for `typescript-operations`. |
| `typesSuffix` | `string` | `""` | Suffix for the referenced type names. Use the same value as for `typescript-operations`. |
| `externalFragments` | `LoadedFragment[]` | `[]` | Fragments that are not part of the documents but can be referenced by them. Usually set by presets. |

When the plugin runs in the same output as `typescript-operations` (as in the
example above), shared options such as `namingConvention` can be set once in
the `config` of the output.

### String documents

With `documentMode: "string"` the operations are emitted as instances of a
`TypedDocumentString` class (a `String` subclass, the same class as generated
by `typed-document-node` and the client preset), which the plugin generates in
the output file. The requester receives the document as a
`TypedDocumentString`; it serializes to the query string, so you do not need
`graphql` at runtime:

```ts
const sdk = getSdk<Params, unknown>((doc, variables, options) =>
	http.post(endpoint, JSON.stringify({ query: doc, variables }), options),
);
```

## Example output

For this operation:

```graphql
query GetProduct($id: ID!, $locale: String) {
  product(id: $id, locale: $locale) {
    ...ProductFields
  }
}
```

the configuration above generates (trimmed; the operation types come from
`typescript-operations`, the document objects are shortened):

```ts
import { type RefinedResponse, type ResponseType } from "k6/http";
import type { DocumentNode } from 'graphql';

export type GetProductQueryVariables = Exact<{
  id: string | number;
  locale?: string | null | undefined;
}>;

export type GetProductQuery = { product: { id: string, name: string, price: number } | null };

export const GetProductDocument = {"kind":"Document","definitions":[ /* ... */ ]} as unknown as DocumentNode;

    export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => RefinedResponse<ResponseType>

    export function getSdk<C, E>(requester: Requester<C, E>) {
      return {
            AddToCart(variables: AddToCartMutationVariables, options?: C): RefinedResponse<ResponseType> {
              return requester<AddToCartMutation, AddToCartMutationVariables>(AddToCartDocument, variables, options);
            },
    GetProduct(variables: GetProductQueryVariables, options?: C): RefinedResponse<ResponseType> {
              return requester<GetProductQuery, GetProductQueryVariables>(GetProductDocument, variables, options);
            },
    ListProducts(variables?: ListProductsQueryVariables, options?: C): RefinedResponse<ResponseType> {
              return requester<ListProductsQuery, ListProductsQueryVariables>(ListProductsDocument, variables, options);
            }
      };
    }
    export type Sdk = ReturnType<typeof getSdk>;
```

The `variables` argument is optional when the operation has no required
variables (such as `ListProducts`).

## Notes and limitations

- Every operation must be named; codegen fails on unnamed operations.
- The SDK methods return the raw k6 `RefinedResponse`; the response body is
  not typed or parsed. Use `res.json()` to read the result.
- The generated `Requester` type refers to `DocumentNode` (or
  `TypedDocumentString` with `documentMode: "string"`); the plugin imports it
  from `documentNodeImport` (default `graphql`).
