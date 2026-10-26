---
"@labdigital/graphql-codegen-typedefs": minor
---

Only print the schema definition as `extend schema { ... }`. Previously the whole printed schema was prefixed with `extend`, which produced invalid output for schemas without root types (`extend type ...`, `extend directive ...`) and for schemas with a description. The description of the schema is dropped from the extension, as extensions cannot have one.

Add the `extendSchema` option (default `true`, the previous behaviour); set it to `false` to print a plain `schema { ... }` definition instead.
