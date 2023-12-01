resource "storyblok_component" "article" {
  name        = "article"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    author = {
      position     = 0
      display_name = "Author"
      required     = false
      type         = "text"
    }
    content = {
      position     = 1
      translatable = true
      display_name = "Content"
      required     = false
      type         = "markdown"
    }
    date = {
      position     = 2
      display_name = "Date"
      required     = false
      type         = "datetime"
      disable_time = true
    }
  }
}

resource "storyblok_component" "banner_block" {
  name        = "banner_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  icon        = "block-image"
  schema = {
    image = {
      position     = 0
      display_name = "Image"
      required     = true
      type         = "asset"
      filetypes = [
        "image"
      ]
    }
    link = {
      position     = 1
      display_name = "Link"
      required     = false
      type         = "multilink"
    }
    title = {
      position     = 2
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
  }
}

resource "storyblok_component" "markdown_block" {
  name        = "markdown_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    content = {
      position     = 0
      translatable = true
      display_name = "Content"
      required     = false
      type         = "markdown"
    }
  }
}

resource "storyblok_component" "page" {
  name        = "page"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    blocks = {
      position     = 0
      display_name = "Blocks"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "markdown_block",
        "banner_block"
      ]
      restrict_components = true
    }
    seoDescription = {
      position     = 1
      translatable = true
      display_name = "Seo description"
      required     = false
      type         = "text"
    }
    seoTitle = {
      position     = 2
      translatable = true
      display_name = "Seo title"
      required     = false
      type         = "text"
    }
    sectionSeo = {
      position     = 3
      type         = "section"
      display_name = "SEO"
      keys = [
        "seoDescription",
        "seoTitle"
      ]
    }
  }
}

resource "storyblok_component" "product_list_block" {
  name        = "product_list_block"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    title = {
      position     = 0
      translatable = true
      display_name = "Title"
      required     = false
      type         = "text"
    }
  }
}

