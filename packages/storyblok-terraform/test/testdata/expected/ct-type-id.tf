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
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "limit"
          value = "1"
        },
        {
          name  = "selectOnly"
          value = "category"
        }
      ]
    }
    categoryIds = {
      position     = 1
      display_name = "Category ids"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "selectOnly"
          value = "category"
        }
      ]
    }
    productId = {
      position     = 2
      display_name = "Product id"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "limit"
          value = "1"
        },
        {
          name  = "selectOnly"
          value = "product"
        }
      ]
    }
    productIds = {
      position     = 3
      display_name = "Product ids"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "limit"
          value = "3"
        },
        {
          name  = "selectOnly"
          value = "product"
        }
      ]
    }
    categoryOrProductId = {
      position     = 4
      display_name = "Category or product id"
      required     = false
      type         = "custom"
      field_type   = "sb-commercetools"
      options = [
        {
          name  = "endpoint"
          value = var.ct_endpoint
        },
        {
          name  = "clientId"
          value = var.ct_client_id
        },
        {
          name  = "clientSecret"
          value = var.ct_client_secret
        },
        {
          name  = "locale"
          value = "nl-NL"
        },
        {
          name  = "limit"
          value = "1"
        }
      ]
    }
  }
}
