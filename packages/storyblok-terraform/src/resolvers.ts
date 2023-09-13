import { mergeResolvers } from '@graphql-tools/merge'
import { DocumentNode } from 'graphql'
import { isObjectTypeDefinitionNode } from './lib/graphql'
import { assetResolvers } from './lib/resolvers/assetResolvers'
import { ctTypeIdResolvers } from './lib/resolvers/ctTypeIdResolvers'
import { idResolvers } from './lib/resolvers/idResolvers'
import { linkResolvers } from './lib/resolvers/linkResolvers'
import { richtextResolvers } from './lib/resolvers/richtextResolvers'
import { seoResolvers } from './lib/resolvers/seoResolver'
import { singleBlokFieldResolvers } from './lib/resolvers/singleBlokResolvers'
import { storyOptionFieldResolvers } from './lib/resolvers/storyOptionResolvers'
import {
  unionArrayFieldResolvers,
  unionResolvers,
} from './lib/resolvers/unionSchemaResolvers'

type Options = {
  slugResolver?: (fullSlug: string, context?: object) => string
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
    storyOptionFieldResolvers(definitions),
    unionResolvers(documentNode.definitions),
    richtextResolvers(definitions),
    linkResolvers(definitions, slugResolver),
    assetResolvers(definitions),
    seoResolvers(definitions),
    ctTypeIdResolvers(definitions),
  ])
}

export const updateContext =
  <C extends {}>(context: C) =>
  <T extends { data: any }>(responseData: T) => {
    Object.assign(context, {
      links: responseData.data.links,
      rels: responseData.data.rels,
    })
    return responseData
  }
