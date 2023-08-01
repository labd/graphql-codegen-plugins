import { gql } from 'graphql-tag'
import { describe, expect, it } from 'vitest'
import { isObjectTypeDefinitionNode } from '../src/lib/graphql'
import { idResolvers } from '../src/lib/resolvers/idResolvers'
import { linkResolvers } from '../src/lib/resolvers/linkResolvers'
import { storyOptionFieldResolvers } from '../src/lib/resolvers/storyOptionResolvers'
import { storyblokResolvers } from '../src/resolvers'

describe('linkResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      url: StoryblokLink @storyblokField
    }
  `
  const resolvers = linkResolvers(
    typeDefs.definitions.filter(isObjectTypeDefinitionNode)
  )

  it('resolves an external url', () => {
    const result = resolvers.Article.url({
      url: { url: 'https://example.com/article/test-article#test-hash' },
    })
    expect(result?.url).toBe(
      'https://example.com/article/test-article#test-hash'
    )
    expect(result?.hash).toBe('test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.type).toBe('external')
    expect(result?.newTab).toBe(true)
  })

  it('can overwrite the newTab to false for external urls', () => {
    const result = resolvers.Article.url({
      url: { url: 'https://example.com', target: '_self' },
    })
    expect(result?.newTab).toBe(false)
  })

  it('resolves an internal url with cached_url', () => {
    const result = resolvers.Article.url({
      url: {
        id: '1',
        linktype: 'story',
        cached_url: 'https://www.example.com/article/test-article',
        anchor: 'test-hash',
      },
    })
    expect(result?.url).toBe('/article/test-article#test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.hash).toBe('test-hash')
    expect(result?.type).toBe('internal')
    expect(result?.newTab).toBe(false)
  })

  it('resolves an internal url with `links` in context', () => {
    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', anchor: 'test-hash' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )
    expect(result?.url).toBe('/article/test-article#test-hash')
    expect(result?.hash).toBe('test-hash')
    expect(result?.pathname).toBe('/article/test-article')
    expect(result?.type).toBe('internal')
    expect(result?.newTab).toBe(false)
  })

  it('can overwrite the newTab to true for an internal url', () => {
    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', target: '_blank' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )
    expect(result?.newTab).toBe(true)
  })

  it('can resolve a slug url', () => {
    const resolvers = linkResolvers(
      typeDefs.definitions.filter(isObjectTypeDefinitionNode),
      (fullSlug) => fullSlug.replace('/article/', '/artikel/')
    )

    const result = resolvers.Article.url(
      { url: { id: '1', linktype: 'story', slug: 'test-article' } },
      null,
      { links: [{ uuid: '1', full_slug: '/article/test-article' }] }
    )

    expect(result?.url).toBe('/artikel/test-article')
  })

  // TODO: test email and asset links
})

it('combines resolvers', () => {
  const typeDefs = gql`
    type Ignore {
      name: String
    }
    type Article @storyblok {
      id: ID!
      url: StoryblokLink @storyblokField
      richtext: String @storyblokField(format: richtext)
      noSpecialResolver: String @storyblokField
      ignored: String
      ignoredType: Ignore
      asset: StoryblokAsset @storyblokField
    }
  `

  const result = storyblokResolvers(typeDefs)

  // we expect these resolvers
  expect(result.Article.id).toBeDefined()
  expect(result.Article.url).toBeDefined()
  expect(result.Article.richtext).toBeDefined()

  // we expect no resolvers for these fields
  expect(result.Article.noSpecialResolver).not.toBeDefined()
  expect(result.Article.ignored).not.toBeDefined()
  expect(result.Article.ignoredType).not.toBeDefined()
  expect(result.Article.asset).not.toBeDefined()
})

describe('idResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      id: ID
    }
  `
  const resolvers = idResolvers(
    typeDefs.definitions.filter(isObjectTypeDefinitionNode)
  )
  it('resolves the id', () => {
    const result = resolvers.Article.id({ _uid: '1' })
    expect(result).toBe('1')
  })
})

describe('storyOptionResolvers', () => {
  const typeDefs = gql`
    type Article @storyblok {
      author: Author @storyblokField
      coAuthors: [Author] @storyblokField
    }
    type Author @storyblok(type: contentType) {
      name: String @storyblokField
    }
  `
  const resolvers = storyOptionFieldResolvers(
    typeDefs.definitions.filter(isObjectTypeDefinitionNode)
  )

  it('resolves the story options from content', () => {
    const resultAuthor = resolvers.Article.author({
      author: { content: { name: 'test' } },
    })
    const resultCoAuthor = resolvers.Article.coAuthors({
      coAuthors: [
        { content: { name: 'test1' } },
        { content: { name: 'test2' } },
      ],
    })
    expect(resultAuthor.name).toBe('test')
    expect(resultCoAuthor[0].name).toBe('test1')
  })

  it('resolves the story options from context', () => {
    const resultAuthor = resolvers.Article.author({ author: '1' }, null, {
      rels: [{ uuid: '1', content: { name: 'test', _uid: '2' } }],
    })
    const resultCoAuthor = resolvers.Article.coAuthors(
      { coAuthors: ['1', '2'] },
      null,
      {
        rels: [
          { uuid: '1', content: { name: 'test1', _uid: '2' } },
          { uuid: '2', content: { name: 'test2', _uid: '2' } },
        ],
      }
    )
    expect(resultAuthor.name).toBe('test')
    expect(resultAuthor.id).toBe('2')
    expect(resultCoAuthor[0].name).toBe('test1')
    expect(resultCoAuthor[0].id).toBe('2')
  })
})
