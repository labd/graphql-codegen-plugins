resource "storyblok_component" "story" {
  name        = "story"
  space_id    = 123
  is_root     = true
  is_nestable = false
  schema = {
    story = {
      position     = 0
      display_name = "Story"
      required     = true
      type         = "option"
      source       = "internal_stories"
      filter_content_type = [
        "story_a"
      ]
      use_uuid = true
    }
    stories = {
      position     = 1
      display_name = "Stories"
      required     = false
      type         = "options"
      source       = "internal_stories"
      filter_content_type = [
        "story_a"
      ]
      use_uuid = true
    }
    union = {
      position     = 2
      display_name = "Union"
      required     = false
      type         = "option"
      source       = "internal_stories"
      filter_content_type = [
        "story_a",
        "story_b"
      ]
      use_uuid = true
    }
    unions = {
      position     = 3
      display_name = "Unions"
      required     = false
      type         = "options"
      source       = "internal_stories"
      filter_content_type = [
        "story_a",
        "story_b"
      ]
      use_uuid = true
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