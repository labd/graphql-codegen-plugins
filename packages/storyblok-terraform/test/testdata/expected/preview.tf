resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
  }
  preview_field = "name"
}

resource "storyblok_component" "b" {
  name        = "b"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
    description = {
      position     = 1
      display_name = "Description"
      required     = false
      type         = "text"
    }
  }
  preview_tmpl = "{{name}} - {{description}}"
}