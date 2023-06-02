import { gql } from 'graphql-tag'

export default gql`
  scalar Date
  scalar DateTime

  enum BlockType {
    nestable
    contentType
    universal
  }

  enum BlockIcon {
    block_at
    block_1_2block
    block_add
    block_arrow_pointer
    block_block
    block_buildin
    block_center_m
    block_comment
    block_doc
    block_dollar_sign
    block_email
    block_image
    block_keyboard
    block_locked
    block_map_pin
    block_mobile
    block_monitor
    block_paycard
    block_resize_fc
    block_cart
    block_share
    block_shield_2
    block_shield
    block_sticker
    block_suitcase
    block_table_2
    block_table
    block_tag
    block_text_c
    block_text_img_c
    block_text_img_l
    block_text_img_r_l
    block_text_img_r
    block_text_img_t_l
    block_text_img_t_r
    block_text_l
    block_text_r
    block_unlocked
    block_wallet
  }

  enum StoryblokTextFormat {
    markdown
    textarea
    text
    richtext
  }
  enum AssetFileTypes {
    images
    videos
    audios
    texts
  }

  # Object directives
  directive @storyblok(
    componentGroup: String
    type: BlockType
    image: String
    preview: String
    icon: BlockIcon
    color: String
  ) on OBJECT

  # Field directives
  directive @storyblokField(
    translatable: Boolean
    previewField: Boolean
    default: String
    min: Int
    max: Int
    format: StoryblokTextFormat
    regex: String
    filetypes: [AssetFileTypes!]
    custom: String
  ) on FIELD_DEFINITION

  type StoryblokAsset {
    alt: String
    filename: String!
    name: String
    isExternalUrl: Boolean!
    title: String
  }

  type StoryblokLink {
    cached_url: String
    linktype: String
    fieldtype: String
    id: String
    url: String
  }
`
