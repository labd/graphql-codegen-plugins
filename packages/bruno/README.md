# @labdigital/graphql-codegen-bruno

[![npm](https://img.shields.io/npm/v/@labdigital/graphql-codegen-bruno)](https://www.npmjs.com/package/@labdigital/graphql-codegen-bruno)

A [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) plugin that
generates a [Bruno](https://www.usebruno.com) request (`.bru` file) for every
named GraphQL operation in your codebase.

Use it to keep an API collection in sync with the queries and mutations your
application actually sends: every request contains the operation, the
fragments it uses and example variables derived from the schema, so you can
run it from Bruno right away.

## Installation

```sh
pnpm add -D @labdigital/graphql-codegen-bruno @graphql-codegen/cli graphql
```

## Usage

Add an output to your `codegen.ts`. The plugin writes the `.bru` files to the
**directory** of the output file; the output file itself gets a JSON index of
the generated requests.

```ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: "schema.graphql",
	documents: ["src/**/*.graphql"],
	generates: {
		// The .bru files are written to the directory of this output file.
		// The file itself contains an index of the generated requests.
		"api-collection/generated/index.json": {
			plugins: ["@labdigital/graphql-codegen-bruno"],
			config: {
				// Remove previously generated requests before generating
				clean: true,
				// URL of the requests (default: "{{graphql-gateway}}/graphql")
				url: "{{baseUrl}}/graphql",
				// Use the auth of the collection (default: "none")
				auth: "inherit",
				// Headers added to every request
				headers: {
					Authorization: "Bearer {{token}}",
				},
				// Override the generated example value of top-level variables
				defaults: {
					locale: "nl-NL",
				},
			},
		},
	},
};

export default config;
```

Then run:

```sh
pnpm graphql-codegen --config codegen.ts
```

This results in:

```text
api-collection/
├── bruno.json              # your Bruno collection (not generated)
└── generated/
    ├── index.json
    ├── mutations/
    │   └── AddToCart.bru
    ├── queries/
    │   ├── GetProduct.bru
    │   └── ListProducts.bru
    └── subscriptions/
        └── CartUpdated.bru
```

By default the requests are sent to `{{graphql-gateway}}/graphql`, so define a
`graphql-gateway` variable (for example `http://localhost:4000`) in your Bruno
environment, or set `url` to match your environment variables.

## Configuration

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `clean` | `boolean` | `false` | Remove the previously generated requests before generating: the `.bru` files in the `queries/`, `mutations/` and `subscriptions/` folders of the output directory (except `folder.bru`), and those folders when they are empty afterwards. Other files, such as `bruno.json`, `collection.bru` or environments, are never removed. |
| `url` | `string` | `"{{graphql-gateway}}/graphql"` | URL of every request. May use Bruno variables. |
| `auth` | `string` | `"none"` | Auth mode of every request. Use `inherit` to use the auth configured on the collection or folder. |
| `headers` | `Record<string, string>` | `{}` | Headers added to the `headers` block of every request. Values may use Bruno variables, such as `{{token}}`. |
| `defaults` | `Record<string, unknown>` | `{}` | Values for operation variables, by variable name. A default replaces the generated example value of a top-level variable with the same name; variables that the operation does not declare are ignored. |

## Example output

Given this schema and operation (with the `ProductFields` fragment defined in
another file):

```graphql
type Query {
  product(id: ID!, locale: String): Product
}

type Product {
  id: ID!
  name: String!
  price: Float!
}
```

```graphql
query GetProduct($id: ID!, $locale: String) {
  product(id: $id, locale: $locale) {
    ...ProductFields
  }
}
```

the configuration above generates `queries/GetProduct.bru`:

```text
meta {
  name: GetProduct
  type: graphql
}

post {
  url: {{baseUrl}}/graphql
  body: graphql
  auth: inherit
}

headers {
  Authorization: Bearer {{token}}
}

body:graphql {
  query GetProduct($id: ID!, $locale: String) {
    product(id: $id, locale: $locale) {
      ...ProductFields
    }
  }
  
  fragment ProductFields on Product {
    id
    name
    price
  }
}

body:graphql:vars {
  {
    "id": "example-id",
    "locale": "nl-NL"
  }
}
```

and `index.json`, which maps each operation to its file and source:

```json
{
  "AddToCart": {
    "filename": "AddToCart.bru",
    "source": "../../src/graphql/add-to-cart.graphql"
  },
  "GetProduct": {
    "filename": "GetProduct.bru",
    "source": "../../src/graphql/get-product.graphql"
  },
  "ListProducts": {
    "filename": "ListProducts.bru",
    "source": "../../src/graphql/list-products.graphql"
  }
}
```

### Example variables

Variables get an example value based on their type:

| Type | Example value |
| ---- | ------------- |
| `Int` | `123` |
| `Float` | `123.45` |
| `String` | `"example"` |
| `Boolean` | `true` |
| `ID` | `"example-id"` |
| Custom scalar | `"example"` |
| Enum | The first enum value |
| Input object | An object with an example value for every field |
| List | A list with one example value |

## Notes and limitations

- Codegen requires a file as output, so the plugin needs an output *file* even
  though it generates a directory. The file is used for the JSON index.
- Queries are written to `queries/`, mutations to `mutations/` and
  subscriptions to `subscriptions/`. Files are named after the operation, so
  operation names must be unique.
- Unnamed operations are skipped.
- The request body contains the operation, followed by the fragments it uses
  (also fragments used by those fragments, and fragments defined in other
  documents), each fragment once. The GraphQL is printed with `graphql`'s
  `print`, so comments in the source documents are not included.
- Without `clean`, requests of operations that were removed or renamed stay in
  the output directory.
- `defaults` only applies to top-level variables; it replaces the whole value,
  it does not merge into input objects.
