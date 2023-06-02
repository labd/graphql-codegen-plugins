import fs from 'fs'
import { buildSchema } from 'graphql'
import { expect, it } from 'vitest'
import { schema as addToSchema, validate } from '../src'

it.each([{ graphqlFile: 'base' }])(
  'Validates valid schema $graphqlFile',
  async ({ graphqlFile }) => {
    const schema = buildSchema(
      addToSchema +
        fs.readFileSync(`./test/testdata/${graphqlFile}.graphql`, 'utf8')
    )
    expect(await validate(schema, [], { space_id: 123 }, 'test.tf', [])).toBe(
      undefined
    )
  }
)
