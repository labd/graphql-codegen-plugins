# @labdigital/graphql-codegen-typedefs

## 0.2.0

### Minor Changes

- f8e2749: Require Node.js >= 22 (Node 18/20 are end-of-life) and update build/test tooling to resolve security advisories. Packages are now built with tsdown instead of tsup (same output files).
- 8ce45bb: Only print the schema definition as `extend schema { ... }`. Previously the whole printed schema was prefixed with `extend`, which produced invalid output for schemas without root types (`extend type ...`, `extend directive ...`) and for schemas with a description. The description of the schema is dropped from the extension, as extensions cannot have one.
  
  Add the `extendSchema` option (default `true`, the previous behaviour); set it to `false` to print a plain `schema { ... }` definition instead.
- 376e6ab: Update dependencies to resolve security advisories: `@graphql-codegen/plugin-helpers` 7, `@graphql-codegen/visitor-plugin-common` 7 and `@graphql-tools/utils` 12. The `graphql` peer dependency now accepts both v16 and v17.
  
  The packages now only publish `dist`, declare `types` in their `exports` map and are marked side-effect free.

### Patch Changes

- 58552a7: Improve README

## 0.1.1

### Patch Changes

- 1dbff4b: Fix ESM only packaging

## 0.1.0

### Minor Changes

- 6547ee2: Switch to ESM only

### Patch Changes

- 17160cf: Update dependencies

## 0.0.3

### Patch Changes

- 1affeb6: resolve release workflow issue

## 0.0.2

### Patch Changes

- 6be8e05: Migrate to mono-repo for all packages

## 0.0.1

### Patch Changes

- 7ebe776: Initial version
