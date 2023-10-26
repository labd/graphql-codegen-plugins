import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'

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
 *     image: (parent) => {
 *       if(parent.image.filename) {
 *         return {
 *           ...parent.image,
 *           isExternalUrl: parent.image.is_external_url
 *         }
 *       }
 *     }
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
              isArray(field.type)
                ? assetsResolver(field.name.value)
                : assetResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

const hasAssetFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isAssetField)

const isAssetField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'StoryblokAsset'

const assetResolver = (prop: string) => (parent: any) => {
  if (parent[prop]?.filename)
    return {
      ...parent[prop],
      isExternalUrl: parent[prop].is_external_url,
    }
}
const assetsResolver = (prop: string) => (parent: any) => {
  if (parent[prop]?.[0].filename)
    return parent[prop].map((item: any) => ({
      ...item,
      isExternalUrl: item.is_external_url,
    }))
}
