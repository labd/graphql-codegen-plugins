import fs from 'fs'
import { buildSchema } from 'graphql'
import path from 'path'
import { expect, it } from 'vitest'
import { schema as addToSchema, plugin } from '../src/index'

it.each([{ graphqlFile: 'base' }])(
  'correct Terraform file for $graphqlFile',
  async ({ graphqlFile }) => {
    const schema = buildSchema(
      addToSchema +
        fs.readFileSync(
          path.join(__dirname, `./testdata/${graphqlFile}.graphql`),
          'utf8'
        )
    )
    const expected = fs.readFileSync(
      path.join(__dirname, `./testdata/expected/${graphqlFile}.tf`),
      'utf8'
    )

    const terraformResult = await plugin(schema, [], {
      space_id: 123,
    })

    // Note: the terraform generator does output the terraform code with ugly formatting.
    // Normally we can deal with this by configuring "prettier" in the codegen config.
    // But in this unittest we test the raw result.
    // Therefore the expected output is also formatted ugly.

    expect(terraformResult.toString().replace(/\r/g, '')).toBe(
      expected.replace(/\r/g, '') + '\n'
    )
  }
)
