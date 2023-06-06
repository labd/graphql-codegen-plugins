resource "storyblok_component" "a"{
name = "a"
space_id = 123
is_root = false
is_nestable = true
schema = {
sectionProp = {
position = 0
display_name = "Section prop"
required = false
type = "text"
}
title = {
position = 1
display_name = "Title"
required = false
type = "text"
}
section = {
type = "section"
display_name = "Section"
keys = [
"sectionProp"
]
}
}
}