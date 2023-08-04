import { camelCase } from 'change-case'
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'

/**
 * Returns resolver structures for resolving seo fields.
 *
 * The storyblok plugin returns fields as snake case, but the graphql type expects camel case.
 *
 * @return richtext as a json serialized string.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   seo: StoryblokSeo@storyblokField
 * }
 * ```
 * ```ts
 * const resolvers = {
 *   Article: {
 *     seo: (parent) => ({
 *       title: parent[prop].title || undefined,
 *       description: parent[prop].description || undefined,
 *       ogTitle: parent[prop].og_title || undefined,
 *       ogDescription: parent[prop].og_description || undefined,
 *       ogImage: parent[prop].ogImage || undefined,
 *       twitterTitle: parent[prop].twitter_title || undefined,
 *       twitterDescription: parent[prop].twitter_description || undefined,
 *       twitterImage: parent[prop].twitter_image || undefined,
 *     })
 *   },
 * }
 * ```
 */
export const seoResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(hasSeoFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isSeoField)
            ?.map((field) => [
              field.name.value,
              seoResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasSeoFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isSeoField)

const isSeoField = (field: FieldDefinitionNode) =>
  !isArray(field.type) && typeName(field.type) === 'StoryblokSeo'

const seoResolver = (prop: string) => (parent: any) =>
  Object.fromEntries(
    Object.entries(parent[prop]).map(([key, value]) => [
      camelCase(key),
      value || undefined,
    ])
  )
