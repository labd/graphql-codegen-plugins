resource "storyblok_component" "story" {
  name        = "story"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    seo = {
      position     = 0
      display_name = "Seo"
      required     = false
      type         = "custom"
      field_type   = "seo-metatags"
    }
  }
}