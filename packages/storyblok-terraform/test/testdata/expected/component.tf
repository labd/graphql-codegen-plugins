resource "storyblok_component" "default_nest" {
  name        = "default_nest"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = true
      type         = "text"
    }
  }
}

resource "storyblok_component" "test" {
  name        = "test"
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
}

resource "storyblok_component" "content_type" {
  name        = "content_type"
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

resource "storyblok_component" "nestable" {
  name        = "nestable"
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
}

resource "storyblok_component" "universal" {
  name        = "universal"
  space_id    = 123
  is_root     = true
  is_nestable = true
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
  }
}

resource "storyblok_component_group" "test_group" {
  name     = "test-group"
  space_id = 123
}

resource "storyblok_component" "group" {
  name                 = "group"
  space_id             = 123
  is_root              = false
  is_nestable          = true
  icon                 = "block-email"
  preview              = "{{ name }}"
  color                = "#ff0000"
  image                = "https://www.example.com/image.jpg"
  component_group_uuid = storyblok_component_group.test_group.uuid
  schema = {
    name = {
      position     = 0
      display_name = "Name"
      required     = false
      type         = "text"
    }
  }
}