resource "storyblok_component" "base" {
  name        = "base"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    text = {
      position     = 0
      display_name = "The Text"
      required     = true
      type         = "text"
      max_length   = 4
    }
    textarea = {
      position     = 1
      display_name = "Textarea"
      required     = true
      type         = "textarea"
    }
    markdown = {
      position     = 2
      display_name = "Markdown"
      required     = true
      type         = "markdown"
    }
    richtext = {
      position      = 3
      display_name  = "Richtext"
      required      = true
      type          = "markdown"
      rich_markdown = true
    }
    optionalRegexText = {
      position     = 4
      display_name = "Optional regex text"
      required     = false
      type         = "text"
      regex        = "/[\\w\\-]+"
    }
    integer = {
      position     = 5
      display_name = "Integer"
      required     = true
      type         = "number"
      min_value    = 2
      max_value    = 10
    }
    optionalInteger = {
      position     = 6
      display_name = "Optional integer"
      required     = false
      type         = "number"
    }
    float = {
      position     = 7
      display_name = "Float"
      required     = true
      type         = "number"
      min_value    = 0
      max_value    = 10
    }
    optionalFloat = {
      position     = 8
      display_name = "Optional float"
      required     = false
      type         = "number"
    }
    boolean = {
      position     = 9
      display_name = "Boolean"
      required     = true
      type         = "boolean"
    }
    optionalBoolean = {
      position     = 10
      display_name = "Optional boolean"
      required     = false
      type         = "boolean"
    }
    date = {
      position     = 11
      display_name = "Date"
      required     = false
      type         = "datetime"
      disable_time = true
    }
    dateTime = {
      position     = 12
      display_name = "Date time"
      required     = false
      type         = "datetime"
    }
    image = {
      position     = 13
      display_name = "Image"
      required     = true
      type         = "asset"
      filetypes = [
        "images"
      ]
    }
    assets = {
      position     = 14
      display_name = "Assets"
      required     = false
      type         = "multiasset"
    }
    option = {
      position     = 15
      display_name = "Option"
      required     = false
      type         = "option"
      options = [
        {
          name  = "A"
          value = "a"
        },
        {
          name  = "B"
          value = "b"
        }
      ]
    }
    options = {
      position     = 16
      display_name = "Options"
      required     = false
      type         = "options"
      options = [
        {
          name  = "A"
          value = "a"
        },
        {
          name  = "B"
          value = "b"
        }
      ]
      minimum = 1
      maximum = 2
    }
    blok = {
      position     = 17
      display_name = "Blok"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "a"
      ]
      restrict_components = true
      minimum             = 0
      maximum             = 1
    }
    bloks = {
      position     = 18
      display_name = "Bloks"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "b"
      ]
      restrict_components = true
      minimum             = 2
      maximum             = 4
    }
    unionBlok = {
      position     = 19
      display_name = "Union blok"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "a",
        "b"
      ]
      restrict_components = true
      minimum             = 0
      maximum             = 1
    }
    unionBloks = {
      position     = 20
      display_name = "Union bloks"
      required     = false
      type         = "bloks"
      component_whitelist = [
        "a",
        "b"
      ]
      restrict_components = true
    }
  }
}

resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    a = {
      position     = 0
      display_name = "A"
      required     = true
      type         = "text"
    }
  }
}

resource "storyblok_component" "b" {
  name        = "b"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    b = {
      position     = 0
      display_name = "B"
      required     = true
      type         = "text"
    }
  }
}