import { Attribute, List, Map } from 'terraform-generator'

export type Component = {
  name: string
  display_name?: string
  is_root?: boolean
  is_nestable?: boolean
  image?: string
  preview?: string
  preview_tmpl?: string
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
  | RichtextComponentField
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
  toolbar?: string[]
  customize_toolbar?: boolean
}

export type RichtextComponentField = ComponentFieldBase & {
  type: 'richtext'
  max_length?: number
  rtl?: boolean
  toolbar?: string[]
  customize_toolbar?: boolean
  allow_target_blank?: boolean
  component_whitelist?: string[]
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
  /** only if source is 'internal_stories'
   * @default true */
  use_uuid?: boolean
  /** only if source is 'internal_stories' */
  filter_content_type?: string[]
  /** only if source is 'internal_stories' */
  folder_slug?: string
  minimum?: number
  maximum?: number
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
  /** only if source is 'internal_stories' */
  filter_content_type?: string[]
  /** only if source is 'internal_stories' */
  folder_slug?: string
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
  link_scope?: string
  force_link_scope?: boolean
  allow_custom_attributes?: boolean
  asset_link_type?: boolean
  allow_target_blank?: boolean
  email_link_type?: boolean
  show_anchor?: boolean
}

export type SectionComponentField = {
  type: 'section'
  display_name?: string
  keys: string[]
}

export type TabComponentField = {
  type: 'tab'
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
