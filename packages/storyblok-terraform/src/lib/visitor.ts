import { paramCase, snakeCase } from 'change-case'
import {
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  StringValueNode,
} from 'graphql'
import { Resource, TerraformGenerator } from 'terraform-generator'
import { maybeDirective, maybeDirectiveValue } from './graphql'
import { toComponent } from './mapper'

/**
 * This visitor checks the GraphQL object type and *updates* the terraform generator to include:
 * - a storyblok_content_type_schema resource
 * - a storyblok_content_type resource
 * - a storyblok_content_type_assignment resource (if a matching content repository is provided)
 */
export const createObjectTypeVisitor =
  (
    schema: GraphQLSchema,
    {
      tfg,
      spaceId,
      componentGroups,
    }: {
      tfg: TerraformGenerator
      spaceId: number
      componentGroups: Resource[]
    }
  ) =>
  (node: ObjectTypeDefinitionNode) => {
    const directive = maybeDirective(node, 'storyblok')
    if (node.name.value.startsWith('Storyblok')) return null

    const componentGroupName = directive
      ? maybeDirectiveValue<StringValueNode>(directive, 'componentGroup')?.value
      : undefined

    let componentGroup = componentGroupName
      ? componentGroups.find(
          (componentGroup) =>
            componentGroup.name === snakeCase(componentGroupName)
        )
      : undefined

    if (componentGroupName && !componentGroup) {
      componentGroup = tfg.resource(
        'storyblok_component_group',
        snakeCase(componentGroupName),
        {
          name: paramCase(componentGroupName),
          space_id: spaceId,
        }
      )
      componentGroups.push(componentGroup)
    }

    tfg.resource(
      'storyblok_component',
      snakeCase(node.name.value),
      toComponent(node, spaceId, componentGroup, schema)
    )

    return null
  }
