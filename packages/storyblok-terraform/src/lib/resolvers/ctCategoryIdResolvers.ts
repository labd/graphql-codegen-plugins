import {
  EnumValueNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql'
import { findStoryblokFieldValue, isArray, typeName } from '../graphql'

/**
 * Returns resolves for resolving Commercetools type ids.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   categoryId: String@storyblokField(ctType: category)
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     categoryId: (parent) => parent.categoryId?.id,
 *   },
 * }
 * ```
 */
export const ctCategoryIdResolvers = (
  definitions: ObjectTypeDefinitionNode[]
) =>
  Object.fromEntries(
    definitions
      .filter(hasCtTypeIdFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isCtCategoryIdField)
            ?.map((field) => [
              field.name.value,
              ctTypeIdResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

type StoryblokPluginData = {
  _uid: string
  id: string
  plugin: 'ct-category'
}

const hasCtTypeIdFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isCtCategoryIdField)

const isCtCategoryIdField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'String' &&
  !isArray(field.type) &&
  findStoryblokFieldValue<EnumValueNode>(field, 'ctType')?.value === 'category'

const ctTypeIdResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData
  return data.id
}
