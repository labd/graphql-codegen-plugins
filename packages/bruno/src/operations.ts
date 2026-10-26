import type { Types } from "@graphql-codegen/plugin-helpers";
import {
	type FragmentDefinitionNode,
	type GraphQLSchema,
	Kind,
	type OperationDefinitionNode,
	type OperationTypeNode,
	print,
	visit,
} from "graphql";
import { generateExampleVariables } from "./vars";

export type FileContent = {
	kind: OperationTypeNode;
	name: string;
	content: string;
	vars: Record<string, unknown>;
	location: string | undefined;
};

/**
 * Returns the names of the fragments used by the given node, including the
 * fragments used by those fragments, in order of first use. Every fragment is
 * listed once.
 */
export const collectUsedFragments = (
	node: OperationDefinitionNode | FragmentDefinitionNode,
	fragments: ReadonlyMap<string, FragmentDefinitionNode>,
): string[] => {
	const used = new Set<string>();

	const collect = (
		current: OperationDefinitionNode | FragmentDefinitionNode,
	) => {
		visit(current, {
			FragmentSpread(spread) {
				const name = spread.name.value;
				if (used.has(name)) {
					return;
				}
				used.add(name);
				const fragment = fragments.get(name);
				if (fragment) {
					collect(fragment);
				}
			},
		});
	};

	collect(node);
	return [...used];
};

export const extractOperations = (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
): FileContent[] => {
	// Collect the fragments of all documents, so operations can use fragments
	// defined in other documents.
	const fragments = new Map<string, FragmentDefinitionNode>();
	for (const doc of documents) {
		for (const definition of doc.document?.definitions ?? []) {
			if (definition.kind === Kind.FRAGMENT_DEFINITION) {
				fragments.set(definition.name.value, definition);
			}
		}
	}

	const results: FileContent[] = [];
	for (const doc of documents) {
		for (const definition of doc.document?.definitions ?? []) {
			// Unnamed operations are skipped
			if (
				definition.kind !== Kind.OPERATION_DEFINITION ||
				!definition.name?.value
			) {
				continue;
			}

			// The request contains the operation itself, followed by the
			// fragments it (transitively) uses.
			const content = [
				definition,
				...collectUsedFragments(definition, fragments)
					.map((name) => fragments.get(name))
					.filter((fragment) => fragment !== undefined),
			]
				.map((node) => print(node))
				.join("\n\n");

			results.push({
				name: definition.name.value,
				location: definition.loc?.source.name ?? doc.location,
				kind: definition.operation,
				content,
				vars: generateExampleVariables(schema, definition),
			});
		}
	}

	return results;
};
