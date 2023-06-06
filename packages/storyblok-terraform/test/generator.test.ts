import fs from 'fs'
import { buildSchema } from 'graphql'
import path from 'path'
import { expect, it } from 'vitest'
import { plugin } from '../src/index'

const readFileSync = (filePath: string) =>
  fs.readFileSync(path.join(__dirname, filePath), 'utf8')

const storyblokBase = readFileSync('../storyblok-base.graphql')

it.each([{ graphqlFile: 'base' }])(
  'correct Terraform file for $graphqlFile',
  async ({ graphqlFile }) => {
    const schema = buildSchema(
      storyblokBase + readFileSync(`./testdata/${graphqlFile}.graphql`)
    )
    const expected = readFileSync(`./testdata/expected/${graphqlFile}.tf`)

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
