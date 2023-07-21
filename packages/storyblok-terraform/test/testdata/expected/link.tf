resource "storyblok_component" "story" {
  name        = "story"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    simpleLink = {
      position     = 0
      display_name = "Simple link"
      required     = false
      type         = "multilink"
    }
    fullFeatureLink = {
      position               = 1
      display_name           = "Full feature link"
      required               = true
      type                   = "multilink"
      link_scope             = "test"
      force_link_scope       = true
      restrict_content_types = true
      component_whitelist = [
        "story_a",
        "story_b"
      ]
      asset_link_type    = true
      allow_target_blank = true
      email_link_type    = true
      show_anchor        = true
    }
  }
}

resource "storyblok_component" "story_a" {
  name        = "story_a"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
  }
}

resource "storyblok_component" "story_b" {
  name        = "story_b"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
  }
}