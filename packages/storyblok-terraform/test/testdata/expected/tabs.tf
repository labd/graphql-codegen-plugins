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
    tabBSectionProp = {
      position     = 2
      display_name = "Tab b section prop"
      required     = false
      type         = "text"
    }
    sectionS = {
      position     = 3
      type         = "section"
      display_name = "s"
      keys = [
        "tabBSectionProp"
      ]
    }
    tabA = {
      position     = 4
      type         = "tab"
      display_name = "a"
      keys = [
        "tabAProp"
      ]
    }
    tabB = {
      position     = 5
      type         = "tab"
      display_name = "b"
      keys = [
        "tabBProp",
        "tabBSectionProp",
        "sectionS"
      ]
    }
  }
}