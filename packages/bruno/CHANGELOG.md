# @labdigital/graphql-codegen-bruno

## 1.4.0

### Minor Changes

- 8ce45bb: Add the `url` and `auth` options for the request URL and auth mode; they default to the previously hardcoded `{{graphql-gateway}}/graphql` and `none`.
  
  This release changes the generated output:
  
  - A request now contains only its operation followed by the fragments it (transitively) uses, each once. Previously it contained the complete source document (including other operations in the same document) and fragments could be included twice. The GraphQL is printed with `graphql`'s `print`, so comments of the source document are no longer included.
  - Subscriptions are written to `subscriptions/` instead of `mutations/`. Run once with `clean: true` (or remove them manually) to remove the subscriptions from `mutations/`.
  - `clean: true` now only removes the previously generated requests (the `.bru` files, except `folder.bru`, in the `queries/`, `mutations/` and `subscriptions/` folders of the output directory) instead of everything in the output directory, so it no longer deletes `bruno.json`, environments or other files.
  - prettier is no longer bundled (the package was 5 MB); formatting is done by `graphql`'s `print`.
- f8e2749: Require Node.js >= 22 (Node 18/20 are end-of-life) and update build/test tooling to resolve security advisories. Packages are now built with tsdown instead of tsup (same output files).
- 376e6ab: Update dependencies to resolve security advisories: `@graphql-codegen/plugin-helpers` 7, `@graphql-codegen/visitor-plugin-common` 7 and `@graphql-tools/utils` 12. The `graphql` peer dependency now accepts both v16 and v17.
  
  The packages now only publish `dist`, declare `types` in their `exports` map and are marked side-effect free.

### Patch Changes

- 58552a7: Improve README

## 1.3.1

### Patch Changes

- 1dbff4b: Fix ESM only packaging

## 1.3.0

### Minor Changes

- 6547ee2: Switch to ESM only

### Patch Changes

- 17160cf: Update dependencies

## 1.2.2

### Patch Changes

- 1cf3275: Sort operations alphabetically to minimize diffs

## 1.2.1

### Patch Changes

- d4475db: Removed header quotations

## 1.2.0

### Minor Changes

- f48334b: Add support for setting http headers

## 1.1.3

### Patch Changes

- e82a0d3: add export for commonjs

## 1.1.2

### Patch Changes

- 1affeb6: resolve release workflow issue

## 1.1.1

### Patch Changes

- 6be8e05: Migrate to mono-repo for all packages
