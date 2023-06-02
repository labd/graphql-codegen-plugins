import fs from 'fs'
import { buildASTSchema, buildSchema } from 'graphql'
import { gql } from 'graphql-tag'
import { expect, it } from 'vitest'
import { schema as addToSchema, validate } from '../src'

it.each([{ graphqlFile: 'base' }, { graphqlFile: 'hierarchy' }])(
  'Validates valid schema $graphqlFile',
  ({ graphqlFile }) => {
    const schema = buildSchema(
      addToSchema +
        fs.readFileSync(`./test/testdata/${graphqlFile}.graphql`, 'utf8')
    )
    expect(validate(schema, [], {}, '', [])).toBe(undefined)
  }
)

it("Throws Error: Fields with '@storyblokLocalized' must be Nullable", () => {
  const schema = buildASTSchema(gql`
    ${addToSchema}
    type Test {
      invalidLocalizedProp: String! @storyblokLocalized
      invalidLocalizedListProp2: [String!] @storyblokLocalized
      invalidLocalizedListProp: [String!]! @storyblokLocalized

      validLocalizedProp: String @storyblokLocalized
      validLocalizedListProp: [String] @storyblokLocalized
      validLocalizedListProp2: [String]! @storyblokLocalized
      validStringProp: String!
    }
  `)
  expect(() => validate(schema, [], {}, '', [])).toThrow(
    "Fields with '@storyblokLocalized' must be Nullable.\n\ntype Test\n\tinvalidLocalizedProp\n\tinvalidLocalizedListProp2\n\tinvalidLocalizedListProp"
  )
})
