import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'

/**
 * Returns resolves for resolving Storyblok tables.
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
export const tableResolvers = (definitions: ObjectTypeDefinitionNode[]) =>
  Object.fromEntries(
    definitions
      .filter(hasTableFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isTableField)
            ?.map((field) => [
              field.name.value,
              tableResolver(field.name.value),
            ]) ?? []
        ),
      ])
  )

type StoryblokPluginData = {
  tbody: {
    _uid: string
    body: {
      _uid: string
      value: string
      component: '_table_col'
    }[]
    component: '_table_row'
  }[]
  thead: {
    _uid: string
    value: string
    component: '_table_head'
  }[]
  fieldtype: 'table'
}

const hasTableFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isTableField)

const isTableField = (field: FieldDefinitionNode) =>
  typeName(field.type) === 'StoryblokTable' && !isArray(field.type)

const tableResolver = (prop: string) => (parent: any) => {
  const data = parent[prop] as StoryblokPluginData

  return {
    thead: data.thead.map((item) => item.value),
    tbody: data.tbody.map((row) => row.body.map((item) => item.value)),
  }
}
