import {
  getCachedDocumentNodeFromSchema,
  PluginFunction,
  PluginValidateFn,
  Types,
} from '@graphql-codegen/plugin-helpers'
import { GraphQLSchema, visit } from 'graphql'
import { extname } from 'path'
import { Resource, TerraformGenerator } from 'terraform-generator'
import { PluginConfig } from './lib/config'
import { isValue } from './lib/value'
import { createObjectTypeVisitor } from './lib/visitor'

export const plugin: PluginFunction<PluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config
) => {
  const astNode = getCachedDocumentNodeFromSchema(schema)
  // This class can build a terraform file string.
  const tfg = new TerraformGenerator()

  const componentGroups: Resource[] = []

  // For each GraphQl object type, add corresponding resources to the terraform generator.
  visit(astNode, {
    ObjectTypeDefinition: {
      leave: createObjectTypeVisitor(schema, {
        tfg,
        spaceId: config.space_id,
        componentGroups,
        ctConfig:
          config.ct_endpoint &&
          config.ct_client_id &&
          config.ct_client_secret &&
          config.ct_locale
            ? {
                endpoint: config.ct_endpoint,
                clientId: config.ct_client_id,
                clientSecret: config.ct_client_secret,
                locale: config.ct_locale,
              }
            : undefined,
      }),
    },
  })

  // Return the terraform file string
  return tfg.generate().tf
}

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: PluginConfig,
  outputFile: string
) => {
  if (extname(outputFile) !== '.tf') {
    throw new Error(
      `Plugin "storyblok-terraform" requires output extension to be ".tf"!`
    )
  }
  if (!config.space_id) {
    throw new Error(
      `Plugin "storyblok-terraform" requires a space_id to be set!`
    )
  }

  const ctValues = [
    config.ct_endpoint,
    config.ct_client_id,
    config.ct_client_secret,
    config.ct_locale,
  ].filter(isValue)

  if (ctValues.length > 0 && ctValues.length < 4) {
    throw new Error(
      `Plugin "storyblok-terraform" requires all of ct_endpoint, ct_client, ct_secret, ct_locale to be set!`
    )
  }
}
