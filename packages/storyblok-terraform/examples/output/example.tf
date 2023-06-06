terraform {
  required_providers {
    storyblok = {
      source = "labd/storyblok"
    }
  }
}

resource "storyblok_component" "article" {
  name         = "article"
  display_name = "Article"
  space_id     = 123
  is_root      = false
  is_nestable  = true
  schema = {
    author = {
      pos          = 0
      display_name = "Author"
      required     = false
      type         = "text"
    }
    content = {
      pos          = 1
      translatable = true
      display_name = "Content"
      required     = false
      type         = "markdown"
    }
    date = {
      pos          = 2
      display_name = "Date"
      required     = false
      type         = "datetime"
      disable_time = true
    }
  }
}

resource "storyblok_component" "banner_block" {
  name         = "banner_block"
  display_name = "Banner block"
  space_id     = 123
  is_root      = false
  is_nestable  = true
  icon         = "block-image"
  schema = {
    image = {
      pos          = 0
      display_name = "Image"
      required     = true
      type         = "asset"
    }
    link = {
      pos          = 1
      display_name = "Link"
      required     = false
      type         = "multilink"
    }
    title = {
      pos          = 2
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
  }
}

resource "storyblok_component" "content_page" {
  name         = "content_page"
  display_name = "Content page"
  space_id     = 123
  is_root      = true
  is_nestable  = false
  schema = {
    body = {
      pos          = 0
      display_name = "Body"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "markdown_block",
        "banner_block"
      ]
    }
    seoDescription = {
      pos          = 1
      translatable = true
      display_name = "Seo description"
      required     = false
      type         = "text"
    }
    seoTitle = {
      pos          = 2
      translatable = true
      display_name = "Seo title"
      required     = false
      type         = "text"
    }
    slug = {
      pos          = 3
      translatable = true
      display_name = "Slug"
      required     = false
      type         = "text"
    }
  }
}

resource "storyblok_component" "markdown_block" {
  name         = "markdown_block"
  display_name = "Markdown block"
  space_id     = 123
  is_root      = false
  is_nestable  = true
  schema = {
    content = {
      pos          = 0
      translatable = true
      display_name = "Content"
      required     = false
      type         = "markdown"
    }
  }
}

resource "storyblok_component" "product_list_block" {
  name         = "product_list_block"
  display_name = "Product list block"
  space_id     = 123
  is_root      = false
  is_nestable  = true
  schema = {
    title = {
      pos          = 0
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
  }
}

