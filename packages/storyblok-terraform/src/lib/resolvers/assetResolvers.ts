import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { typeName } from '../graphql'

/**
 * Returns resolves for resolving StoryblokAsset fields.
 *
 * Asset data from storyblok contains empty fields if no image is uploaded
 * (i.e. `{filename: null}` instead of just `null`).
 * The StoryblokAsset type however requires a filename to be there.
 * These resolvers simply return undefined if the filename is missing.
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   image: StoryblokAsset@storyblokField
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     image: (parent) => parent.filename ? parent : undefined
 *   },
 * }
 * ```
 */
export const assetResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(hasAssetFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isAssetField)
            ?.map((field) => [
              field.name.value,
              assetResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasAssetFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isAssetField)

const isAssetField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'StoryblokAsset'

const assetResolver = (prop: string) => (parent: any) =>
  parent[prop]?.filename ? parent[prop] : undefined
