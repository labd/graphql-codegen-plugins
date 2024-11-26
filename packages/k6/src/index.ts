import {
	type PluginFunction,
	type Types,
	oldVisit,
} from "@graphql-codegen/plugin-helpers";
import type {
	LoadedFragment,
	RawClientSideBasePluginConfig,
} from "@graphql-codegen/visitor-plugin-common";
import {
	type FragmentDefinitionNode,
	type GraphQLSchema,
	Kind,
	concatAST,
} from "graphql";
import type { RawK6PluginConfig } from "./config";
import { GenericSdkVisitor } from "./visitor";

export const plugin: PluginFunction<RawK6PluginConfig> = (
	schema: GraphQLSchema,
	documents: Types.DocumentFile[],
	config: RawClientSideBasePluginConfig,
) => {
	const allAst = concatAST(
		// @ts-expect-error
		documents.reduce((prev, v) => {
			// biome-ignore lint: performance/noAccumulatingSpread
			return [...prev, v.document];
		}, []),
	);
	const allFragments: LoadedFragment[] = [
		...(
			allAst.definitions.filter(
				(d) => d.kind === Kind.FRAGMENT_DEFINITION,
			) as FragmentDefinitionNode[]
		).map((fragmentDef) => ({
			node: fragmentDef,
			name: fragmentDef.name.value,
			onType: fragmentDef.typeCondition.name.value,
			isExternal: false,
		})),
		...(config.externalFragments || []),
	];
	const visitor = new GenericSdkVisitor(schema, allFragments, config);

	// @ts-expect-error
	const visitorResult = oldVisit(allAst, { leave: visitor });

	return {
		prepend: visitor.getImports(),
		content: [
			visitor.fragments,
			// @ts-expect-error
			...visitorResult.definitions.filter((t) => typeof t === "string"),
			visitor.sdkContent,
		].join("\n"),
	};
};

export { GenericSdkVisitor };
