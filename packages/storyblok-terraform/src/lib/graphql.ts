import {
  DefinitionNode,
  FieldDefinitionNode,
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

export const isObjectTypeDefinitionNode = (
  definitionNode: DefinitionNode
): definitionNode is ObjectTypeDefinitionNode =>
  definitionNode.kind === 'ObjectTypeDefinition'

export const typeName = (type: TypeNode): string => namedType(type).name.value

export const namedType = (type: TypeNode): NamedTypeNode => {
  switch (type.kind) {
    case 'ListType':
      return namedType(type.type)
    case 'NamedType':
      return type
    case 'NonNullType':
      return namedType(type.type)
    default:
      throw new Error(type.kind)
  }
}

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
