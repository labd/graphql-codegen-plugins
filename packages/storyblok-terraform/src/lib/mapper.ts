import { camelCase, sentenceCase, snakeCase } from 'change-case'
import {
  BooleanValueNode,
  ConstListValueNode,
  EnumValueNode,
  FieldDefinitionNode,
  GraphQLInterfaceType,
  GraphQLSchema,
  IntValueNode,
  ObjectTypeDefinitionNode,
  StringValueNode,
  TypeNode,
  isEnumType,
  isObjectType,
  isUnionType,
} from 'graphql'
import { Resource, list, map } from 'terraform-generator'
import {
  hasDirective,
  maybeDirective,
  maybeDirectiveValue,
  switchArray,
  typeName,
} from './graphql'
import {
  AssetComponentField,
  BloksComponentField,
  BooleanComponentField,
  Component,
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
import { ifValue, isValue } from './value'

export const toComponent = (
  node: ObjectTypeDefinitionNode,
  spaceId: number,
  componentGroup: Resource | undefined,
  schema: GraphQLSchema
): Component => ({
  name: snakeCase(node.name.value),
  space_id: spaceId,
  is_root: false,
  is_nestable: true,
  ...ifValue(maybeDirective(node, 'storyblok'), (directive) => ({
    is_nestable:
      maybeDirectiveValue<EnumValueNode>(directive, 'type')?.value !==
      'contentType',
    is_root: ['contentType', 'universal'].includes(
      maybeDirectiveValue<EnumValueNode>(directive, 'type')?.value ?? ''
    ),
    // Disabled until supported by the terraform provider:
    //
    // icon: ifValue(
    //   maybeDirectiveValue<EnumValueNode>(directive, 'icon')?.value,
    //   toIconValue
    // ),
    // preview: maybeDirectiveValue<StringValueNode>(directive, 'preview')?.value,
    // color: maybeDirectiveValue<StringValueNode>(directive, 'color')?.value,
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
  Object.fromEntries([
    ...(node.fields
      ?.filter((field) => hasDirective(field, 'storyblokField'))
      .map((field, position) => [
        field.name.value,
        map({
          position,
          ...ifValue(maybeDirective(field, 'storyblokField'), (directive) => ({
            translatable: maybeDirectiveValue<BooleanValueNode>(
              directive,
              'translatable'
            )?.value,
            default_value: maybeDirectiveValue<StringValueNode>(
              directive,
              'default'
            )?.value,
            no_translate: maybeDirectiveValue<StringValueNode>(
              directive,
              'excludeFromExport'
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
      ]) ?? []),
    ...(node.interfaces?.map((i) => [
      camelCase(i.name.value),
      map(
        toSectionComponentField(
          schema.getType(i.name.value) as GraphQLInterfaceType
        )
      ),
    ]) ?? []),
  ])

const toSectionComponentField = (
  node: GraphQLInterfaceType
): SectionComponentField => ({
  type: 'section',
  display_name: sentenceCase(node.name),
  keys: node.astNode?.fields?.map((f) => f.name.value) ?? [],
})

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
      restrict_components: true,
      ...ifValue(maybeDirective(prop, 'storyblokField'), (d) => ({
        minimum: ifValue(
          maybeDirectiveValue<IntValueNode>(d, 'minimum')?.value,
          Number
        ),
        maximum: ifValue(
          maybeDirectiveValue<IntValueNode>(d, 'maximum')?.value,
          Number
        ),
      })),
    }
  }

  if (isEnumType(node) && node.astNode) {
    return {
      type: 'options',
      options: list(
        node.astNode.values!.map((value) =>
          map({
            name: value.name.value,
            value: value.name.value,
          })
        )
      ),
    }
  }

  if (node?.name === 'StoryblokAsset') {
    return {
      type: 'multiasset',
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
        options: list(
          node.astNode.values!.map((value) =>
            map({
              name: value.name.value,
              value: value.name.value,
            })
          )
        ),
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
        restrict_components: true,
        minimum: prop.type.kind === 'NonNullType' ? 1 : 0,
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

      const stringType = maybeDirectiveValue<StringValueNode>(
        directive,
        'format'
      )?.value

      switch (stringType) {
        case 'richtext': {
          return {
            type: 'markdown',
            rtl: maybeDirectiveValue<BooleanValueNode>(directive, 'rtl')?.value,
            max_length: ifValue(
              maybeDirectiveValue<IntValueNode>(directive, 'max')?.value,
              Number
            ),
            rich_markdown: true,
          }
        }
        case 'markdown': {
          return {
            type: 'markdown',
            rtl: maybeDirectiveValue<BooleanValueNode>(directive, 'rtl')?.value,
            max_length: ifValue(
              maybeDirectiveValue<IntValueNode>(directive, 'max')?.value,
              Number
            ),
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
          decimals_value: ifValue(
            maybeDirectiveValue<StringValueNode>(d, 'decimals')?.value,
            Number
          ),
          steps_value: ifValue(
            maybeDirectiveValue<StringValueNode>(d, 'steps')?.value,
            Number
          ),
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
