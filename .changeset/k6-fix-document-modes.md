---
"@labdigital/graphql-codegen-k6": patch
---

Fix the generated code for `documentMode` `graphQLTag` (the default) and `external`: the `Requester` type referred to `DocumentNode` without importing it, so the output did not type check. `DocumentNode` is now imported from `documentNodeImport` (default `graphql`), respecting `useTypeImports`.

Fix `documentMode: "string"`: the output referred to a `TypedDocumentString` class that was never defined. The class is now generated (the same class as `typed-document-node` and the client preset use), the operation documents are typed with their result and variables, and the requester receives the `TypedDocumentString` (which serializes to the query string).
