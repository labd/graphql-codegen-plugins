import { GraphQLSchema } from 'graphql'
import { isObjectTypeDefinitionNode } from './graphql'
import { isValue } from './util'

export const getObjectTypeDefinitions = (schema: GraphQLSchema) =>
  Object.values(schema.getTypeMap())
    .map((type) => type.astNode)
    .filter(isValue)
    .filter(isObjectTypeDefinitionNode)
