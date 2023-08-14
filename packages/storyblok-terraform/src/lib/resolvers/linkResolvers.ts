import { FieldDefinitionNode, ObjectTypeDefinitionNode } from 'graphql'
import { isArray, typeName } from '../graphql'
import { ifValue } from '../value'

/**
 * Returns resolves for resolving StoryblokLink fields.
 *
 * For internal links, we will look in the context for the `links` array which should be set after the storyblok api call.
 * To get links, do a request with the `resolve_links=url` parameter.
 *
 *
 * @example
 * ```graphql
 * type Article@storyblok {
 *   link: StoryblokLink@storyblokField
 * }
 * ```
 * ```ts
 * // result looks something like this:
 * const resolvers = {
 *   Article: {
 *     link: (parent) => ({
 *       url: ...
 *       pathname: ...
 *       hash: ...
 *       newTab: ...
 *       type: ...
 *     })
 *   },
 * }
 * ```
 */
export const linkResolvers = (
  definitions: ObjectTypeDefinitionNode[],
  slugResolver = (input: string) => input
) =>
  Object.fromEntries(
    definitions
      .filter(hasLinkFields)
      .map((node) => [
        node.name.value,
        Object.fromEntries(
          node.fields
            ?.filter(isLinkField)
            ?.map((field) => [
              field.name.value,
              linkResolver(field.name.value, slugResolver),
            ]) ?? []
        ),
      ])
  )

type ApiLink = {
  id?: string
  linktype: 'story' | 'url' | 'email' | 'asset'
  fieldtype?: 'multilink'
  url: string
  cached_url?: string
  target?: '_self' | '_blank'
  anchor?: string
}

const hasLinkFields = (node: ObjectTypeDefinitionNode) =>
  node.fields?.some(isLinkField)

const isLinkField = (field: FieldDefinitionNode) =>
  !isArray(field.type) && typeName(field.type) === 'StoryblokLink'

type StoryblokLink = {
  type: 'internal' | 'external' | 'email' | 'asset'
  url: string
  pathname: string
  hash?: string
  newTab: boolean
}

type Link = {
  uuid: string
  [others: string]: any
}

const linkResolver =
  (prop: string, slugResolver: (input: string, context?: object) => string) =>
  (parent: any, _args?: any, context?: { links?: Link[] }) =>
    ifValue(parent[prop] as ApiLink, (link): StoryblokLink | undefined =>
      link.linktype === 'story' && link.id
        ? {
            type: 'internal',
            hash: link.anchor,
            newTab: link.target === '_blank', // internal links are not newTab by default
            ...(ifValue(
              context?.links?.find((l) => l.uuid === link.id)?.full_slug,
              (fullSlug) => ({
                url:
                  slugResolver(fullSlug, context) +
                  (link.anchor ? `#${link.anchor}` : ''),
                pathname: slugResolver(fullSlug, context),
              })
            ) ?? {
              url: link.cached_url?.startsWith('http')
                ? new URL(link.cached_url).pathname +
                  (link.anchor ? `#${link.anchor}` : '')
                : link.cached_url ?? '',
              pathname: link.cached_url?.startsWith('http')
                ? new URL(link.cached_url).pathname
                : link.cached_url ?? '',
            }),
          }
        : link.linktype === 'email'
        ? {
            type: 'email',
            newTab: true,
            url: `mailto:${link.url}`,
            pathname: `mailto:${link.url}`,
          }
        : link.linktype === 'asset' && link.id
        ? {
            type: 'asset',
            newTab: true,
            url: link.url,
            pathname: link.url,
          }
        : link.url?.startsWith('http')
        ? {
            type: 'external',
            url: link.url,
            pathname: new URL(link.url).pathname,
            hash: new URL(link.url).hash.substring(1), // remove the first '#'
            newTab: link.target !== '_self', // external links are newTab by default
          }
        : undefined
    )
