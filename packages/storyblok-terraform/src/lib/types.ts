import { Attribute, List, Map } from 'terraform-generator'

export type Component = {
  name: string
  display_name?: string
  is_root?: boolean
  is_nestable?: boolean
  image?: string
  component_group_uuid?: Attribute
  schema: Map //  Record<string, ComponentField>
  color?: string
  icon?: string
  space_id: number
}

export type ComponentField =
  | BloksComponentField
  | TextComponentField
  | TextareaComponentField
  | MarkdownComponentField
  | NumberComponentField
  | DatetimeComponentField
  | BooleanComponentField
  | OptionsComponentField
  | OptionComponentField
  | AssetComponentField
  | MultiassetComponentField
  | MultilinkComponentField
  | SectionComponentField
  | CustomComponentField

export type ComponentFieldBase = {
  // pos: number
  translatable?: boolean
  required?: boolean
  description?: string
  display_name?: string
  default_value?: string
}

export type BloksComponentField = Omit<ComponentFieldBase, 'translatable'> & {
  type: 'bloks'
  component_whitelist?: string[]
  minimum?: number
  maximum?: number
  restrict_components?: boolean
}

export type TextComponentField = ComponentFieldBase & {
  type: 'text'
  max_length?: number
  rtl?: boolean
  regex?: string
}

export type TextareaComponentField = ComponentFieldBase & {
  type: 'textarea'
  max_length?: number
  rtl?: boolean
}

export type MarkdownComponentField = ComponentFieldBase & {
  type: 'markdown'
  max_length?: number
  rtl?: boolean
  rich_markdown?: boolean
}

export type NumberComponentField = ComponentFieldBase & {
  type: 'number'
  no_translate?: boolean
  min_value?: number
  max_value?: number
  decimals_value?: number
  steps_value?: number
}

export type DatetimeComponentField = ComponentFieldBase & {
  type: 'datetime'
  disable_time?: boolean
}

export type BooleanComponentField = ComponentFieldBase & {
  type: 'boolean'
}

type Option = { name: string; value: string }
export type OptionsComponentField = ComponentFieldBase & {
  type: 'options'
  source?: 'internal_stories' | 'internal' | 'external'
  /** Only if source is undefined */
  options?: List // Option[]
  /** only if source is 'external' */
  external_datasource?: string
  /** only if source is 'internal' */
  datasource_slug?: string
}

export type OptionComponentField = ComponentFieldBase & {
  type: 'option'
  source?: 'internal_stories' | 'internal' | 'external'
  /** Only if source is undefined */
  options?: List // Option[]
  /** only if source is 'external' */
  external_datasource?: string
  /** only if source is 'internal' */
  datasource_slug?: string
  /** only if source is 'internal_stories'
   * @default true */
  use_uuid?: boolean
}

export type AssetComponentField = ComponentFieldBase & {
  type: 'asset'
  filetypes?: ('images' | 'videos' | 'audios' | 'texts')[]
}

export type MultiassetComponentField = ComponentFieldBase & {
  type: 'multiasset'
  filetypes?: ('images' | 'videos' | 'audios' | 'texts')[]
}

export type MultilinkComponentField = ComponentFieldBase & {
  type: 'multilink'
  restrict_content_types?: boolean
  component_whitelist?: string[]
}

export type SectionComponentField = {
  type: 'section'
  display_name?: string
  keys: string[]
}

export type CustomComponentField = ComponentFieldBase & {
  type: 'custom'
  field_type?: string
  source?: 'internal_stories' | 'internal' | 'external'
  /** only if source is 'external' */
  external_datasource?: string
  /** only if source is 'internal' */
  datasource_slug?: string
}
