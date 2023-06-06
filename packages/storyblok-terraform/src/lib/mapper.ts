import { sentenceCase, snakeCase } from 'change-case'
import {
  BooleanValueNode,
  ConstListValueNode,
  EnumValueNode,
  FieldDefinitionNode,
  GraphQLSchema,
  IntValueNode,
  ObjectTypeDefinitionNode,
  StringValueNode,
  TypeNode,
  isEnumType,
  isObjectType,
  isUnionType,
} from 'graphql'
import { Resource, map } from 'terraform-generator'
import {
  maybeDirective,
  maybeDirectiveValue,
  switchArray,
  typeName,
} from './graphql'
import {
  AssetComponentField,
  BloksComponentField,
  BooleanComponentField,
  ComponentField,
  CustomComponentField,
  DatetimeComponentField,
  MarkdownComponentField,
  MultiassetComponentField,
  MultilinkComponentField,
  NumberComponentField,
  OptionComponentField,
  OptionsComponentField,
  SectionComponentField,
  TextComponentField,
  TextareaComponentField,
} from './types'
import { ifValue, isValue } from './util'

export const toComponent = (
  node: ObjectTypeDefinitionNode,
  spaceId: number,
  componentGroup: Resource | undefined,
  schema: GraphQLSchema
) => ({
  name: snakeCase(node.name.value),
  space_id: spaceId,
  is_root: false,
  is_nestable: true,
  ...ifValue(maybeDirective(node, 'storyblok'), (directive) => ({
    // icon: ifValue(
    //   maybeDirectiveValue<EnumValueNode>(directive, 'icon')?.value,
    //   toIconValue
    // ),
    // color: maybeDirectiveValue<StringValueNode>(directive, 'color')?.value,
    is_nestable:
      maybeDirectiveValue<EnumValueNode>(directive, 'type')?.value !==
      'contentType',
    is_root: ['contentType', 'universal'].includes(
      maybeDirectiveValue<EnumValueNode>(directive, 'type')?.value ?? ''
    ),
    // image: maybeDirectiveValue<StringValueNode>(directive, 'image')?.value,
  })),
  component_group_uuid: componentGroup?.attr('uuid'),
  schema: map(toSchema(node, schema)),
})

const toIconValue = (value: string) =>
  value === 'block_at' ? 'block-@' : value.replace(/_/g, '-')

export const toSchema = (
  node: ObjectTypeDefinitionNode,
  schema: GraphQLSchema
) =>
  Object.fromEntries(
    node.fields?.map((field, position) => [
      field.name.value,
      map({
        position,
        ...ifValue(maybeDirective(field, 'storyblokField'), (directive) => ({
          translatable: maybeDirectiveValue<BooleanValueNode>(
            directive,
            'translatable'
          )?.value,
        })),
        display_name: sentenceCase(field.name.value),
        required: field.type.kind === 'NonNullType',
        description: field.description?.value,
        ...switchArray<ComponentField>(field.type, {
          ifArray: (subType) => toArrayComponentField(field, subType, schema),
          other: (type) => toComponentField(field, type, schema),
        }),
      }),
    ]) ?? []
  )

const toArrayComponentField = (
  prop: FieldDefinitionNode,
  type: TypeNode,
  schema: GraphQLSchema
): OptionsComponentField | MultiassetComponentField | BloksComponentField => {
  const node = schema.getType(typeName(type))

  if (isObjectType(node) || isUnionType(node)) {
    return {
      type: 'bloks',
      component_whitelist: isUnionType(node)
        ? node.astNode?.types?.map((type) => snakeCase(typeName(type)))
        : [snakeCase(node.name)],
    }
  }

  if (isEnumType(node) && node.astNode) {
    return {
      type: 'options',
      options: node.astNode.values!.map((value) => ({
        name: value.name.value,
        value: value.name.value,
      })),
    }
  }

  if (node?.name === 'StoryblokAsset') {
    return {
      type: 'multiasset',
      ...ifValue(maybeDirective(prop, 'storyblokField'), (d) => ({
        filetypes:
          maybeDirectiveValue<ConstListValueNode>(d, 'format')
            ?.values.map((v) =>
              v.kind === 'StringValue' ? (v.value as 'images') : undefined
            )
            .filter(isValue) ?? [],
      })),
    }
  }

  throw new Error(`Unsupported array type ${typeName(type)}`)
}

const toComponentField = (
  prop: FieldDefinitionNode,
  type: TypeNode,
  schema: GraphQLSchema
):
  | BloksComponentField
  | TextComponentField
  | TextareaComponentField
  | MarkdownComponentField
  | NumberComponentField
  | DatetimeComponentField
  | BooleanComponentField
  | OptionComponentField
  | AssetComponentField
  | MultilinkComponentField
  | SectionComponentField
  | CustomComponentField => {
  const node = schema.getType(typeName(type))

  if (node) {
    if (isEnumType(node) && node.astNode) {
      return {
        type: 'option',
        options: node.astNode.values!.map((value) => ({
          name: value.name.value,
          value: value.name.value,
        })),
      }
    }

    switch (typeName(type)) {
      case 'StoryblokAsset': {
        return {
          type: 'asset',
          ...ifValue(maybeDirective(prop, 'storyblokField'), (d) => ({
            filetypes:
              maybeDirectiveValue<ConstListValueNode>(d, 'filetypes')
                ?.values.map((v) =>
                  v.kind === 'StringValue' ? (v.value as 'images') : undefined
                )
                .filter(isValue) ?? [],
          })),
        }
      }
      case 'StoryblokLink': {
        return {
          type: 'multilink',

          ...ifValue(maybeDirective(prop, 'storyblokField'), (d) => ({
            filetypes:
              maybeDirectiveValue<ConstListValueNode>(d, 'filetypes')
                ?.values.map((v) =>
                  v.kind === 'StringValue' ? (v.value as 'images') : undefined
                )
                .filter(isValue) ?? [],
          })),
        }
      }
    }

    if (isObjectType(node) || isUnionType(node)) {
      return {
        type: 'bloks',
        component_whitelist: isUnionType(node)
          ? node.astNode?.types?.map((type) => snakeCase(typeName(type)))
          : [snakeCase(node.name)],
        maximum: 1,
      }
    }
  }

  switch (typeName(type)) {
    case 'String': {
      const directive = maybeDirective(prop, 'storyblokField')

      if (!directive) {
        return {
          type: 'text',
        }
      }

      const stringType =
        maybeDirectiveValue<StringValueNode>(directive, 'format')?.value ??
        'text'

      switch (stringType) {
        case 'markdown': {
          return {
            type: 'markdown',
            rtl: maybeDirectiveValue<BooleanValueNode>(directive, 'rtl')?.value,
            max_length: ifValue(
              maybeDirectiveValue<IntValueNode>(directive, 'max')?.value,
              Number
            ),
            rich_markdown: maybeDirectiveValue<BooleanValueNode>(
              directive,
              'richMarkdown'
            )?.value,
          }
        }
        case 'textarea': {
          return {
            type: 'textarea',
            rtl: maybeDirectiveValue<BooleanValueNode>(directive, 'rtl')?.value,
            max_length: ifValue(
              maybeDirectiveValue<IntValueNode>(directive, 'max')?.value,
              Number
            ),
          }
        }
        default: {
          return {
            type: 'text',
            rtl: maybeDirectiveValue<BooleanValueNode>(directive, 'rtl')?.value,
            max_length: ifValue(
              maybeDirectiveValue<IntValueNode>(directive, 'max')?.value,
              Number
            ),
            regex: maybeDirectiveValue<IntValueNode>(directive, 'regex')?.value,
          }
        }
      }
    }
    case 'Boolean': {
      return {
        type: 'boolean',
      }
    }
    case 'Int':
    case 'Float':
      return {
        type: 'number',
        ...ifValue(maybeDirective(prop, 'storyblokField'), (d) => ({
          format: maybeDirectiveValue<StringValueNode>(d, 'format')?.value,
          min_value: ifValue(
            maybeDirectiveValue<IntValueNode>(d, 'min')?.value,
            Number
          ),
          max_value: ifValue(
            maybeDirectiveValue<IntValueNode>(d, 'max')?.value,
            Number
          ),
        })),
      }
    case 'Date': {
      return {
        type: 'datetime',
        disable_time: true,
      }
    }
    case 'DateTime': {
      return {
        type: 'datetime',
      }
    }
  }

  throw new Error(`Unsupported type ${typeName(type)}`)
}
