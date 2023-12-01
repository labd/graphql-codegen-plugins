# storyblok-graphql-codegen-terraform

This is a plugin for GraphQL Codegen that outputs your schema to Storyblok resources in Terraform.

This terraform code is dependent on the [Storyblok Terraform provider](https://registry.terraform.io/providers/labd/storyblok/latest).

For an example output see [the example output terraform file](examples/output/example.tf).

For more information on the Storyblok Terraform provider, see the documentation on the [terraform registry](https://registry.terraform.io/providers/labd/storyblok/latest/docs).

# codegen.yml

A basic example:

```yml
overwrite: true
schema:
  - storyblok-graphql-codegen-terraform
  - ./schemas/example.graphql
hooks:
  afterAllFileWrite:
    - terraform fmt
generates:
  terraform/example.tf:
    plugins:
      - storyblok-graphql-codegen-terraform
    config:
      space_id: 123
```

# Your Graphql file

Basic example:

```graphql
# For root content types, add the `@storyblok(type: contentType)` directive
type Page @storyblok(type: contentType) {
  # Add a `@storyblokField` directive to add extra configuration for a field such as translations
  seoTitle: String @storyblokField(translatable: true, section: "SEO")
  seoDescription: String @storyblokField(translatable: true, section: "SEO")

  blocks: [Block] @storyblokField
}

union Block = MarkdownBlock | BannerBlock

# By default a type is a nested Storyblok component
type MarkdownBlock @storyblok {
  content: String @storyblokField(format: markdown, translatable: true)
}

type BannerBlock @storyblok(icon: block_image) {
  title: String @storyblokField(translatable: true)
  link: StoryblokLink @storyblokField
  image: StoryblokAsset! @storyblokField(filetypes: [image])
}

type ProductListBlock @storyblok {
  title: String @storyblokField(translatable: true)
}

type Article @storyblok {
  # This field will be ignored
  systemField: String
  date: Date @storyblokField
  author: String @storyblokField
  content: String @storyblokField(format: markdown, translatable: true)
}
```

## Advanced examples

### Tabs and Sections

Fields can be grouped into tabs and/or sections with corresponding storyblokField arguments.

```graphql
type A @storyblok {
  a: String @storyblokField(tab: "my-tab")
  b: String @storyblokField(tab: "my-tab")
  c: String @storyblokField(section: "my-section")
}
```

### Story Option Type

A story option type renders a dropdown list with available stories.

To create an option field with a story reference, create a field that references to `contentType` or `universal`.

```graphql
type A @storyblok {
  story: Story @storyblokField(folder: "{0}/some-folder")
}

type Story @storyblok(type: contentType) {
  name: String @storyblokField
}
```

Similarly, you'll get an options field if you provide an array.
Furthermore, the reference may also be a union type.
But if so, all types of the union type must either be a `contentType` or a `universal` type.

# Your resolvers file

This repository also contains a set of resolvers that can be used to do a couple of things:

- resolve internal and external links
- resolve an `id` field (based on the `_uid` field)
- resolve single blok fields
- resolve rich text as a serialized JSON string
- resolve union types
- resolve stories for single and multiple option fields

## Usage

```ts
import { logger } from '@commerce-backend/observability'
import { mergeResolvers } from '@graphql-tools/merge'
import {
  storyblokResolvers,
  updateContext,
} from 'storyblok-graphql-codegen-terraform/resolvers'
import StoryblokClient from 'storyblok-js-client'
import { typeDefs } from './typedefs.js'

const client = new StoryblokClient({
  accessToken: process.env.STORYBLOK_ACCESS_TOKEN,
})

export const customResolvers = {
  Query: {
    contentPage: (_parent, args, context, _info) =>
      client
        .get(`cdn/stories/pages/${args.path}`, {
          resolve_links: 'url', // this is required for the link resolver to work
          resolve_relations: ['content_page.usps'], // TODO: make this dynamic
        })
        // Use the update context so the resolvers can resolve links and story options
        .then(updateContext(context))
        .then((response) => ({
          ...response.data?.story.content,
          pageId: response.data?.story.id,
        })),
  },
}

const resolvers = mergeResolvers([
  // include all storyblok resolvers
  storyblokResolvers(typeDefs, {
    // optionally modify the relative story paths for the link resolver
    slugResolver: (fullPath) => fullPath.split('/pages/')?.[1] ?? fullPath,
  }),
  // add your own resolvers
  customResolvers,
])

export default resolvers
```
