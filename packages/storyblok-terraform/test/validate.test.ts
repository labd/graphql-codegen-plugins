import { buildSchema } from 'graphql'
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
