resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    table = {
      position     = 0
      display_name = "Table"
      required     = false
      type         = "table"
    }
  }
}