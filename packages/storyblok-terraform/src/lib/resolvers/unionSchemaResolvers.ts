import { pascalCase } from 'change-case'
import {
  DefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  UnionTypeDefinitionNode,
  isTypeDefinitionNode,
} from 'graphql'
import { storyblokComponentExists, typeName } from '../graphql'

type Meta = {
  component: string
}

/**
 * Returns resolver structures for resolving union array fields.
 *
 * ```ts
 * {
 *  InformationPage: {
 *    blocks: enumArraySchemaResolver('blocks', definitions)
 *  },
 * ...etc.
 * }
 * ```
 */
export const unionArrayFieldResolvers = (definitions: TypeDefinitionNode[]) => {
  const unionNames = getUnions(definitions).map((u) => u.name.value)
  return Object.fromEntries(
    definitions
      .filter(isObjectWithUnionFields(unionNames))
      .map((objectDef) => [
        objectDef.name.value,
        Object.fromEntries(
          getUnionFields(objectDef, unionNames).map((fieldDef) => [
            fieldDef.name.value,
            unionArraySchemaResolver(fieldDef.name.value, definitions),
          ])
        ),
      ])
  )
}

/**
 * Returns resolver structures for resolving union fields.
 */
export const unionResolvers = (definitions: readonly DefinitionNode[]) =>
  Object.fromEntries(
    getUnions(definitions).map(({ name }) => [
      name.value,
      {
        __resolveType: unionSchemaResolver(
          definitions.filter(isTypeDefinitionNode)
        ),
      },
    ])
  )

const unionArraySchemaResolver =
  (arrayProp: string, definitions: TypeDefinitionNode[]) => (entry: any) => {
    if (!(arrayProp in entry)) {
      return []
    }

    const value = entry[arrayProp]

    if (!Array.isArray(value)) {
      return value
    }

    return value
      .filter(Boolean)
      .filter((meta: Meta) =>
        storyblokComponentExists(meta.component, definitions)
      )
  }

/**
 * Maps Storyblok content to a specific GraphQL type for that content.
 * This function checks the Storyblok schema name and maps it to a corresponding GraphQL type union.
 */
const unionSchemaResolver =
  (definitions: TypeDefinitionNode[]) => (meta: Meta) =>
    storyblokComponentExists(meta.component, definitions)
      ? pascalCase(meta.component)
      : undefined

const getUnions = (definitions: readonly DefinitionNode[]) =>
  definitions.filter(
    (d): d is UnionTypeDefinitionNode => d.kind === Kind.UNION_TYPE_DEFINITION
  )

const isObjectWithUnionFields =
  (unionNames: string[]) =>
  (d: TypeDefinitionNode): d is ObjectTypeDefinitionNode =>
    (d.kind === Kind.OBJECT_TYPE_DEFINITION &&
      d.fields?.some((f) => unionNames.includes(typeName(f.type) ?? ''))) ||
    false

const getUnionFields = (o: ObjectTypeDefinitionNode, unionNames: string[]) =>
  o.fields!.filter((f) => unionNames.includes(typeName(f.type) ?? ''))
