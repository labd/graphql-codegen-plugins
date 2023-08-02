import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { findDefinition, isArray, isNestable } from '../graphql'
import { ifValue } from '../value'

/**
 * Returns resolver structures for resolving single blok fields.
 *
 * These are fields defined by GraphQL that refer to a single Storyblok component.
 * The Storyblok api returns an array for a "bloks" type, even though we expect a single object.
 * These resolvers return the first object in those arrays.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   hero: Hero@storyblokField
 * }
 * type Hero @storyblok {
 *  title: String
 * }
 * ```
 * ```ts
 * const resolvers = {
 *  Article: {
 *   hero: (parent) => parent.hero[0]
 * }
 * ```
 *
 */
export const singleBlokFieldResolvers = (
  definitions: ObjectTypeDefinitionNode[]
) =>
  Object.fromEntries(
    definitions
      .filter(hasSingleBlokFields(definitions))
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isSingleBlokField(definitions))
            .map((field) => [
              field.name.value,
              singleBlokResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasSingleBlokFields =
  (definitions: ObjectTypeDefinitionNode[]) =>
  (node: ObjectTypeDefinitionNode) =>
    !['Query'].includes(node.name.value) &&
    node.fields?.some(isSingleBlokField(definitions))

const isSingleBlokField =
  (definitions: ObjectTypeDefinitionNode[]) => (field: FieldDefinitionNode) =>
    !isArray(field.type) &&
    ifValue(findDefinition(definitions, field.type), isNestable)

const singleBlokResolver = (prop: string) => (parent: any) => parent[prop]?.[0]
