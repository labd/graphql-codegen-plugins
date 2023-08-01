import { mergeResolvers } from '@graphql-tools/merge'
import { DocumentNode } from 'graphql'
import { isObjectTypeDefinitionNode } from './lib/graphql'
import { idResolvers } from './lib/resolvers/idResolvers'
import { linkResolvers } from './lib/resolvers/linkResolvers'
import { richtextResolvers } from './lib/resolvers/richtextResolvers'
import { singleBlokFieldResolvers } from './lib/resolvers/singleBlokResolvers'
import {
  unionArrayFieldResolvers,
  unionResolvers,
} from './lib/resolvers/unionSchemaResolvers'

type Options = {
  slugResolver?: (fullSlug: string) => string
}

export const storyblokResolvers = (
  documentNode: DocumentNode,
  { slugResolver }: Options = {
    slugResolver: (fullSlug: string) => fullSlug,
  }
): any => {
  const definitions = documentNode.definitions.filter(
    isObjectTypeDefinitionNode
  )
  return mergeResolvers([
    idResolvers(definitions),
    singleBlokFieldResolvers(definitions),
    unionArrayFieldResolvers(definitions),
    unionResolvers(documentNode.definitions),
    richtextResolvers(definitions),
    linkResolvers(definitions, slugResolver),
  ])
}
export const updateContext = (context: any) => (responseData: any) => {
  Object.assign(context, {
    links: responseData.data.links,
    rels: responseData.data.rels,
  })
  return responseData
}
