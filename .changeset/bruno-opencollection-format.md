---
"@labdigital/graphql-codegen-bruno": minor
---

Add the `format` option: `yml` writes the requests in the OpenCollection (YAML) format, for a Bruno collection with an `opencollection.yml`, which does not load `.bru` files. The default stays `bru`. `clean` now also removes previously generated `.yml` requests (except `folder.yml`).
