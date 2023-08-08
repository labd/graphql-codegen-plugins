resource "storyblok_component" "story" {
  name        = "story"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    datasource = {
      position        = 0
      display_name    = "Datasource"
      required        = true
      type            = "option"
      datasource_slug = "test"
      source          = "internal"
      use_uuid        = true
    }
    datasources = {
      position        = 1
      display_name    = "Datasources"
      required        = false
      type            = "options"
      datasource_slug = "test"
      source          = "internal"
      use_uuid        = true
    }
  }
}