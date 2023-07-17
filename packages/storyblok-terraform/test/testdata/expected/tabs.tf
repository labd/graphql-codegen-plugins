resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    tabAProp = {
      position     = 0
      display_name = "Tab a prop"
      required     = false
      type         = "text"
    }
    tabBProp = {
      position     = 1
      display_name = "Tab b prop"
      required     = false
      type         = "text"
    }
    tabA = {
      position     = 2
      type         = "tab"
      display_name = "A"
      keys = [
        "tabAProp"
      ]
    }
    tabB = {
      position     = 3
      type         = "tab"
      display_name = "B"
      keys = [
        "tabBProp"
      ]
    }
  }
}