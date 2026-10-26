# @labdigital/graphql-codegen-k6

## 0.2.0

### Minor Changes

- f8e2749: Require Node.js >= 22 (Node 18/20 are end-of-life) and update build/test tooling to resolve security advisories. Packages are now built with tsdown instead of tsup (same output files).
- 376e6ab: Update dependencies to resolve security advisories: `@graphql-codegen/plugin-helpers` 7, `@graphql-codegen/visitor-plugin-common` 7 and `@graphql-tools/utils` 12. The `graphql` peer dependency now accepts both v16 and v17.
  
  The packages now only publish `dist`, declare `types` in their `exports` map and are marked side-effect free.

### Patch Changes

- 58552a7: Improve README
- 8ce45bb: Fix the generated code for `documentMode` `graphQLTag` (the default) and `external`: the `Requester` type referred to `DocumentNode` without importing it, so the output did not type check. `DocumentNode` is now imported from `documentNodeImport` (default `graphql`), respecting `useTypeImports`.
  
  Fix `documentMode: "string"`: the output referred to a `TypedDocumentString` class that was never defined. The class is now generated (the same class as `typed-document-node` and the client preset use), the operation documents are typed with their result and variables, and the requester receives the `TypedDocumentString` (which serializes to the query string).

## 0.1.1

### Patch Changes

- 1dbff4b: Fix ESM only packaging

## 0.1.0

### Minor Changes

- 6547ee2: Switch to ESM only

### Patch Changes

- 17160cf: Update dependencies

## 0.0.5

### Patch Changes

- e82a0d3: add export for commonjs

## 0.0.4

### Patch Changes

- 1affeb6: resolve release workflow issue

## 0.0.3

### Patch Changes

- 6be8e05: Migrate to mono-repo for all packages
