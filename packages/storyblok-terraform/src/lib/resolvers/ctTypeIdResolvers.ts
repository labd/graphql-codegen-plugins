import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'

/**
 * Returns resolves for resolving Commercetools type ids.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   categoryId: CtTypeId@storyblokField(ctType: category)
 *   productIds: CtTypeId@storyblokField(ctType: product)
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     categoryId: (parent) => parent.categoryId?.items[0].id,
 *     productIds: (parent) => parent.productIds?.items[0].map((item) => item.id),
 *   },
 * }
 * ```
 */
export const ctTypeIdResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(hasCtTypeIdFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isCtTypeIdField)
            ?.map((field) => [
              field.name.value,
              isArray(field.type)
                ? ctTypeIdsResolver(field.name.value)
                : ctTypeIdResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

type StoryblokPluginData = {
  _uid: string
  items: [
    {
      id: string
      name: string
      type: 'category' | 'product'
      childCount?: number
      description: string
    }
  ]
  plugin: 'sb-commercetools'
}

const hasCtTypeIdFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isCtTypeIdField)

const isCtTypeIdField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'CtTypeId'

const ctTypeIdResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData
  return data.items[0].id
}

const ctTypeIdsResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData
  return data.items.map((item) => item.id)
}
