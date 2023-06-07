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
import { createObjectTypeVisitor } from './lib/visitor'

export const plugin: PluginFunction<PluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  { space_id }
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
        spaceId: space_id,
        componentGroups,
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
}
