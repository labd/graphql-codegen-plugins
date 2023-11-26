import {
  EnumValueNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql'
import { findStoryblokFieldValue, isArray, typeName } from '../graphql'

/**
 * Returns resolver structures for resolving richtext fields.
 *
 * Storyblok returns rich text as a dynamic json object, but we simplify it a as a serialized string.
 * This is because it does not make sense to partially retrieve the rich text json,
 * so therefore you would otherwise need a very exhaustive and complete query.
 *
 * @return richtext as a json serialized string.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   content: String@storyblokField(format: "richtext")
 * }
 * ```
 * ```ts
 * const resolvers = {
 *   Article: {
 *     content: (parent) => JSON.stringify(parent.content)
 *   },
 * }
 * ```
 */
export const richtextResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(hasRichtextFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isRichtextField)
            ?.map((field) => [
              field.name.value,
              richtextResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasRichtextFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isRichtextField)

const isRichtextField = (field: FieldDefinitionNode) =>
  !isArray(field.type) &&
  typeName(field.type) === 'String' &&
  findStoryblokFieldValue<EnumValueNode>(field, 'format')?.value === 'richtext'

export const richtextResolver = (prop: string) => (parent: any) =>
  JSON.stringify(parent[prop])
