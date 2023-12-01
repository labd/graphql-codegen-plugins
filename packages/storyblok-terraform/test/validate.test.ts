import { GraphQLSchema, buildSchema } from 'graphql'
import { expect, it } from 'vitest'
import { validate } from '../src'
import { readFileSync } from './file'

const storyblokBase = readFileSync('../storyblok-base.graphql')

it.each([{ graphqlFile: 'fields' }])(
  'Validates valid schema $graphqlFile',
  async ({ graphqlFile }) => {
    const schema = buildSchema(
      storyblokBase + readFileSync(`./testdata/${graphqlFile}.graphql`)
    )
    expect(await validate(schema, [], { space_id: 123 }, 'test.tf', [])).toBe(
      undefined
    )
  }
)

it('Validates complete Commercetools config', async () => {
  expect(
    await validate(
      {} as GraphQLSchema,
      [],
      {
        space_id: 123,
        ct_endpoint: 'x',
        ct_client_id: 'x',
        ct_client_secret: 'x',
        ct_locale: 'x',
      },
      'test.tf',
      []
    )
  ).toBe(undefined)
})

it('Throws on incomplete Commercetools config', async () => {
  await expect(() =>
    validate(
      {} as GraphQLSchema,
      [],
      {
        space_id: 123,
        ct_endpoint: 'x',
        ct_client_id: 'x',
        ct_client_secret: 'x',
      },
      'test.tf',
      []
    )
  ).rejects.toThrowError()
})
