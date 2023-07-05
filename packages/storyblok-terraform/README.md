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
# An interface creates a section in Storyblok
interface PageMeta {
  seoTitle: String
  seoDescription: String
  slug: String
}

# For root content types, add the `@storyblok(type: contentType)` directive
type Page implements PageMeta @storyblok(type: contentType) {
  # Add a `@storyblokField` directive to add extra configuration for a field such as translations
  seoTitle: String @storyblokField(translatable: true)
  seoDescription: String @storyblokField(translatable: true)
  slug: String @storyblokField(translatable: true)

  blocks: [Block]
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
