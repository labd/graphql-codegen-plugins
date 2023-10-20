resource "storyblok_component" "a" {
  name        = "a"
  space_id    = 123
  is_root     = false
  is_nestable = true
  schema = {
    categoryId = {
      position     = 0
      display_name = "Category id"
      required     = false
      type         = "custom"
      field_type   = "ct-category"
      options = [
        {
          name  = "projectKey"
          value = var.ct_project_key
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        }
      ]
    }
  }
}
