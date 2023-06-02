export type Component = {
  name: string
  display_name?: string
  is_root?: boolean
  is_nestable?: boolean
  image?: string
  component_group_uuid?: string
  schema: Record<string, ComponentField>
  color?: string
  icon?: string
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

export type OptionsComponentField = ComponentFieldBase & {
  type: 'options'
  source?: 'internal_stories' | 'internal' | 'external'
  /** Only if source is undefined */
  options?: {
    name: string
    value: string
  }[]
  /** only if source is 'external' */
  external_datasource?: string
  /** only if source is 'internal' */
  datasource_slug?: string
}

export type OptionComponentField = ComponentFieldBase & {
  type: 'option'
  source?: 'internal_stories' | 'internal' | 'external'
  /** Only if source is undefined */
  options?: {
    name: string
    value: string
  }[]
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
  columns?: boolean
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

// export type ComponentField = {
//   // id: string // Numeric Unique ID |
//   default_value?: string // Default value for the field; Can be an escaped JSON object |
//   can_sync?: boolean // Advanced usage to sync with field in preview; Default: false |
//   preview_field?: string // Is used as instance preview field below component name in bloks types |
//   no_translate?: boolean // Boolean; Should be excluded in translation export |
//   folder_slug: string // Filter on selectable stories path; Effects editor only if `source=internal_stories`; In case you have a multi-language folder structure you can add the '{0}' placeholder and the path will be adapted dynamically. Examples: *"{0}/categories/"*, *{0}/{1}/categories/* |
//   datasource_slug: string // Define selectable datasources string; Effects editor only if `source=internal: string //
//   external_datasource: string // Define external datasource JSON Url; Effects editor only if `source=external: string //
// }
