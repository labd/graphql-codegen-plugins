import { EnumValueNode, Kind, ObjectTypeDefinitionNode } from 'graphql'
import { findStoryblokValue, typeName } from './graphql'

/**
 * Returns resolver structures for resolving single blok fields.
 *
 * These are fields defined by GraphQL that refer to a single Storyblok component.
 * The Storyblok api returns an array for a "bloks" type, even though we expect a single object.
 * These resolvers return the first object in those arrays.
 */
export const singleBlokFieldResolvers = (
  definitions: ObjectTypeDefinitionNode[]
) =>
  Object.fromEntries(
    definitions
      .filter(isObjectWithSingleBlokFields(definitions))
      .map((objectDef) => [
        objectDef.name.value,
        Object.fromEntries(
          getSingleBlokFields(objectDef, definitions).map((fieldDef) => [
            fieldDef.name.value,
            singleBlokResolver(fieldDef.name.value),
          ])
        ),
      ])
  )

const isObjectWithSingleBlokFields =
  (definitions: ObjectTypeDefinitionNode[]) =>
  (node: ObjectTypeDefinitionNode) =>
    (!['Query'].includes(node.name.value) &&
      node.fields?.some(
        (f) =>
          f.type.kind !== Kind.LIST_TYPE &&
          !(
            f.type.kind === Kind.NON_NULL_TYPE &&
            f.type.type.kind === Kind.LIST_TYPE
          ) &&
          definitions
            .find((t) => t.name.value === typeName(f.type))
            ?.directives?.some((d) => d.name.value === 'storyblok')
      )) ||
    false

const getSingleBlokFields = (
  o: ObjectTypeDefinitionNode,
  definitions: ObjectTypeDefinitionNode[]
) =>
  o.fields?.filter((f) => {
    const node = definitions.find((d) => d.name.value === typeName(f.type))

    return (
      node &&
      node.directives?.some((d) => d.name.value === 'storyblok') &&
      f.type.kind !== Kind.LIST_TYPE &&
      !(
        f.type.kind === Kind.NON_NULL_TYPE &&
        f.type.type.kind === Kind.LIST_TYPE
      ) &&
      findStoryblokValue<EnumValueNode>(node, 'type')?.value !== 'contentType'
    )
  }) ?? []

const singleBlokResolver = (prop: string) => (parent: any) => parent[prop][0]
