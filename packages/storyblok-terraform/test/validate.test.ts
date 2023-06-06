import fs from 'fs'
import { buildSchema } from 'graphql'
import { expect, it } from 'vitest'
import { validate } from '../src'
import { readFileSync } from './file'

const storyblokBase = readFileSync('../storyblok-base.graphql')

it.each([{ graphqlFile: 'base' }])(
  'Validates valid schema $graphqlFile',
  async ({ graphqlFile }) => {
    const schema = buildSchema(
      storyblokBase +
        fs.readFileSync(`./test/testdata/${graphqlFile}.graphql`, 'utf8')
    )
    expect(await validate(schema, [], { space_id: 123 }, 'test.tf', [])).toBe(
      undefined
    )
  }
)
