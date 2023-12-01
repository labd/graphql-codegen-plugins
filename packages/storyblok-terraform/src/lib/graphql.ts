import { pascalCase } from 'change-case'
import {
  DefinitionNode,
  EnumValueNode,
  FieldDefinitionNode,
  Kind,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  TypeDefinitionNode,
  TypeNode,
  ValueNode,
} from 'graphql'

export const findStoryblokFieldValue = <T extends ValueNode>(
  symbol: FieldDefinitionNode,
  argument: string
) =>
  symbol.directives
    ?.find((t) => t.name.value === 'storyblokField')
    ?.arguments?.find((t) => t.name.value === argument)?.value as T | undefined

export const findStoryblokValue = <T extends ValueNode>(
  symbol: TypeDefinitionNode,
  argument: string
) =>
  symbol.directives
    ?.find((t) => t.name.value === 'storyblok')
    ?.arguments?.find((t) => t.name.value === argument)?.value as T | undefined

export const hasDirective = (
  symbol: FieldDefinitionNode | TypeDefinitionNode,
  name: string
) => symbol.directives?.some((t) => t.name.value === name)

export const typeName = (type: TypeNode): string => namedType(type).name.value

export const namedType = (type: TypeNode): NamedTypeNode => {
  switch (type.kind) {
    case 'ListType':
    case 'NonNullType':
      return namedType(type.type)
    case 'NamedType':
      return type
    default:
      throw new Error(type.kind)
  }
}

export const isArray = (type: TypeNode) =>
  type.kind === 'ListType' ||
  (type.kind === 'NonNullType' && type.type.kind === 'ListType')

export const switchArray = <T>(
  type: TypeNode,
  {
    ifArray,
    other,
  }: { ifArray: (subType: TypeNode) => T; other: (type: TypeNode) => T }
) =>
  type.kind === 'ListType'
    ? ifArray(type.type)
    : type.kind === 'NonNullType' && type.type.kind === 'ListType'
    ? ifArray(type.type.type)
    : other(type)

export const isObjectTypeDefinitionNode = (
  node: DefinitionNode
): node is ObjectTypeDefinitionNode => node.kind === Kind.OBJECT_TYPE_DEFINITION

export const storyblokComponentExists = (
  componentName: string,
  definitions: TypeDefinitionNode[]
) =>
  definitions.some(
    (definition) => definition.name.value === pascalCase(componentName)
  )

export const findDefinition = (
  definitions: ObjectTypeDefinitionNode[],
  typeNode: TypeNode
) => definitions.find((d) => d.name.value === typeName(typeNode))

export const isNestable = (node: ObjectTypeDefinitionNode) =>
  // Either 'nestable' or 'universal' (or undefined, since that is treated as 'nestable')
  hasDirective(node, 'storyblok') &&
  findStoryblokValue<EnumValueNode>(node, 'type')?.value !== 'contentType'

export const isRoot = (node: ObjectTypeDefinitionNode) =>
  // Either 'contentType' or 'universal'
  ['contentType', 'universal'].includes(
    findStoryblokValue<EnumValueNode>(node, 'type')?.value ?? ''
  )
