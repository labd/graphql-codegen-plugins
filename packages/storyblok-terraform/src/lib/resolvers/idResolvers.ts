import { pascalCase } from 'change-case'
import { ObjectTypeDefinitionNode } from 'graphql'
import { hasDirective } from '../graphql'

/**
 * Returns resolver structures for id fields.
 *
 * Storyblok returns IDs as `_uid`.
 * These resolvers simply map that to `id`.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   id: ID!
 * }
 * ```
 * ```ts
 * const resolvers = {
 *   Article: {
 *     id: (parent) => parent._uid
 *   },
 * }
 * ```
 */
export const idResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(
        (node) =>
          hasDirective(node, 'storyblok') &&
          node.fields?.some((f) => f.name.value === 'id')
      )
      .map((node) => [
        node.name.value,
        {
          __typename: (parent: any) =>
            pascalCase(parent.component ?? parent[0].component),
          id: (parent: any) => parent._uid ?? parent[0]?._uid,
        },
      ])
  )
