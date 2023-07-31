import { DocumentNode } from 'graphql'
import { isObjectTypeDefinitionNode } from './lib/graphql'
import { singleBlokFieldResolvers } from './lib/singleBlokResolver'
import {
  unionArrayFieldResolvers,
  unionResolvers,
} from './lib/unionSchemaResolver'

export const storyblokResolvers = (documentNode: DocumentNode) => {
  const definitions = documentNode.definitions.filter(
    isObjectTypeDefinitionNode
  )
  return {
    ...singleBlokFieldResolvers(definitions),
    ...unionArrayFieldResolvers(definitions),
    ...unionResolvers(documentNode.definitions),
  }
}
