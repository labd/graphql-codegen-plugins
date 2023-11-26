import { parse } from 'graphql'
import { describe, expect, it } from 'vitest'
import { richtextResolver, richtextResolvers } from './richtextResolvers'

describe('richtextResolvers', () => {
  it('should parse definition', () => {
    const field = parse(`
      type RichText @storyblok(componentGroup: "Content") {
        id: ID!
        content: String!
          @storyblokField(
            translatable: true
            format: richtext
            toolbar: [
              bold
              list
              paragraph
              h2
              h3
              italic
              blok
              link
              olist
              paste_action
              underline
            ]
            blokTypes: ["ButtonListBlock"]
          )
      }`)

    const resolvers = richtextResolvers(field.definitions as any)
    const fieldResolver = resolvers['RichText']['content']

    const data = {
      component: 'rich_text',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
        ],
      },
    }
    const result = fieldResolver(data)
    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }],
    })

    expect(result).toEqual(expected)
  })
})

describe('richtextResolver', () => {
  it('should handle empty field', () => {
    const prop = 'content'
    const data = {
      component: 'rich_text',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    }

    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    })

    const result = richtextResolver(prop)(data)
    expect(result).toEqual(expected)
  })

  it('should serialize data to string', () => {
    const prop = 'content'
    const data = {
      component: 'rich_text',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
        ],
      },
    }
    const expected = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }],
    })

    const result = richtextResolver(prop)(data)
    expect(result).toEqual(expected)
  })
})
