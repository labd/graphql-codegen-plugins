import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { buildSchema } from 'graphql'
import path from 'path'
import { expect, it } from 'vitest'
import { plugin } from '../src/index'
import { readFileSync, writeFileSync } from './file'

const storyblokBase = readFileSync('../storyblok-base.graphql')
const testNames = readdirSync(path.join(__dirname, './testdata'), {
  withFileTypes: true,
})
  .filter((f) => f.isFile())
  .map(({ name }) => path.parse(name).name)

console.log(testNames)

it.each(testNames)('has a correct Terraform file for %s', (graphqlFile) => {
  const schema = buildSchema(
    storyblokBase + readFileSync(`./testdata/${graphqlFile}.graphql`)
  )

  // The terraform generator does output the terraform code with ugly formatting.
  // Therefore we have to remove some white space from the expected output.
  const expected = readFileSync(`./testdata/expected/${graphqlFile}.tf`)
    .replace(/^ +/gm, '') // remove starting spaces
    .replace(/  +/g, ' ') // remove double spaces
    .replace(/" \{/g, '"{') // remove last space of a resource line
    .trim() // remove ending white space

  const terraformResult = plugin(schema, [], {
    space_id: 123,
  })
    .toString()
    .trim()

  if (process.env.UPDATE_SNAPSHOTS) {
    writeFileSync(`./testdata/expected/${graphqlFile}.tf`, terraformResult)
    execSync(`terraform fmt test/testdata/expected`)
  }

  expect(terraformResult).toBe(expected)
})
