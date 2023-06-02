terraform {
required_providers {
storyblok = {
source = "labd/storyblok"
}
}
}

resource "storyblok_component" "default_nest"{
name = "default_nest"
display_name = "Default nest"
space_id = 123
is_root = false
is_nestable = true
schema {
name {
pos = 0
display_name = "Name"
required = true
type = "text"
}
}
}

resource "storyblok_component" "test"{
name = "test"
display_name = "Test"
space_id = 123
is_root = false
is_nestable = true
schema {
name {
pos = 0
display_name = "Name"
required = false
type = "text"
}
}
}

resource "storyblok_component" "content_type"{
name = "content_type"
display_name = "Content type"
space_id = 123
is_root = true
is_nestable = false
schema {
name {
pos = 0
display_name = "Name"
required = false
type = "text"
}
}
}

resource "storyblok_component" "nestable"{
name = "nestable"
display_name = "Nestable"
space_id = 123
is_root = false
is_nestable = true
schema {
name {
pos = 0
display_name = "Name"
required = false
type = "text"
}
}
}

resource "storyblok_component" "universal"{
name = "universal"
display_name = "Universal"
space_id = 123
is_root = true
is_nestable = true
schema {
name {
pos = 0
display_name = "Name"
required = false
type = "text"
}
}
}

resource "storyblok_component_group" "test_group"{
name = "test-group"
space_id = 123
}

resource "storyblok_component" "group"{
name = "group"
display_name = "Group"
space_id = 123
is_root = false
is_nestable = true
icon = "block-email"
color = "#ff0000"
image = "https://www.example.com/image.jpg"
component_group_uuid = storyblok_component_group.test_group.uuid
schema {
name {
pos = 0
display_name = "Name"
required = false
type = "text"
}
}
}
