# GraphQL Codegen Plugins

Plugins for [GraphQL Code Generator](https://the-guild.dev/graphql/codegen),
maintained by [Lab Digital](https://www.labdigital.nl).

## Packages

| Package | Version | Description |
| ------- | ------- | ----------- |
| [`@labdigital/graphql-codegen-bruno`](./packages/bruno/README.md) | [![npm](https://img.shields.io/npm/v/@labdigital/graphql-codegen-bruno)](https://www.npmjs.com/package/@labdigital/graphql-codegen-bruno) | Generates a [Bruno](https://www.usebruno.com) request (`.bru` file) for every GraphQL operation in your codebase. |
| [`@labdigital/graphql-codegen-k6`](./packages/k6/README.md) | [![npm](https://img.shields.io/npm/v/@labdigital/graphql-codegen-k6)](https://www.npmjs.com/package/@labdigital/graphql-codegen-k6) | Generates a typed SDK for your GraphQL operations that you can use in [k6](https://k6.io) load tests. |
| [`@labdigital/graphql-codegen-typedefs`](./packages/typedefs/README.md) | [![npm](https://img.shields.io/npm/v/@labdigital/graphql-codegen-typedefs)](https://www.npmjs.com/package/@labdigital/graphql-codegen-typedefs) | Generates a TypeScript module that exports your GraphQL schema as a `typeDefs` document. |

## Requirements

- Node.js 22 or newer
- `graphql` `^16.0.0 || ^17.0.0`
- `@graphql-codegen/cli` 7.x

All packages are published as ES modules only.

## Usage

Install the CLI and the plugin you need, then reference the plugin by its
package name in your `codegen.ts`:

```sh
pnpm add -D @graphql-codegen/cli graphql @labdigital/graphql-codegen-typedefs
```

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "schema.graphql",
	generates: {
		"src/generated/typedefs.ts": {
			plugins: ["@labdigital/graphql-codegen-typedefs"],
		},
	},
};

export default config;
```

```sh
pnpm graphql-codegen --config codegen.ts
```

See the README of each package for its configuration options and example
output.

## Development

This is a [pnpm](https://pnpm.io) workspace (pnpm 12, see `packageManager` in
`package.json`) using [Turborepo](https://turborepo.com) for builds,
[tsdown](https://tsdown.dev) for bundling, [Vitest](https://vitest.dev) for
tests and [Biome](https://biomejs.dev) for formatting and linting.

```sh
pnpm install     # install dependencies
pnpm build       # build all packages (packages/*/dist)
pnpm test        # run the tests
pnpm check       # biome ci + typecheck, as run in CI
pnpm format      # apply biome formatting and safe fixes
```

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets).

1. Add a changeset to every pull request that changes a published package:

   ```sh
   pnpm changeset
   ```

2. When the pull request is merged into `main`, the release workflow opens (or
   updates) a "Release new version" pull request that bumps the versions and
   updates the changelogs.
3. Merging that pull request publishes the new versions to npm (with
   provenance, via npm trusted publishing).

## License

[MIT](./LICENSE) © Lab Digital
