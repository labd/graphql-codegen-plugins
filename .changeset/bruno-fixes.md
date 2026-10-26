---
"@labdigital/graphql-codegen-bruno": minor
---

Add the `url` and `auth` options for the request URL and auth mode; they default to the previously hardcoded `{{graphql-gateway}}/graphql` and `none`.

This release changes the generated output:

- A request now contains only its operation followed by the fragments it (transitively) uses, each once. Previously it contained the complete source document (including other operations in the same document) and fragments could be included twice. The GraphQL is printed with `graphql`'s `print`, so comments of the source document are no longer included.
- Subscriptions are written to `subscriptions/` instead of `mutations/`. Run once with `clean: true` (or remove them manually) to remove the subscriptions from `mutations/`.
- `clean: true` now only removes the previously generated requests (the `.bru` files, except `folder.bru`, in the `queries/`, `mutations/` and `subscriptions/` folders of the output directory) instead of everything in the output directory, so it no longer deletes `bruno.json`, environments or other files.
- prettier is no longer bundled (the package was 5 MB); formatting is done by `graphql`'s `print`.
