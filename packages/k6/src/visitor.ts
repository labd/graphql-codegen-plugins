import {
	type ClientSideBasePluginConfig,
	ClientSideBaseVisitor,
	DocumentMode,
	type LoadedFragment,
	indentMultiline,
} from "@graphql-codegen/visitor-plugin-common";
import autoBind from "auto-bind";
import {
	type GraphQLSchema,
	Kind,
	type OperationDefinitionNode,
	print,
} from "graphql";
import type { RawK6PluginConfig } from "./config";

export interface K6PluginConfig extends ClientSideBasePluginConfig {}

export class GenericSdkVisitor extends ClientSideBaseVisitor<
	RawK6PluginConfig,
	K6PluginConfig
> {
	private _externalImportPrefix: string;
	private _operationsToInclude: {
		node: OperationDefinitionNode;
		documentVariableName: string;
		operationType: string;
		operationResultType: string;
		operationVariablesTypes: string;
	}[] = [];

	constructor(
		schema: GraphQLSchema,
		fragments: LoadedFragment[],
		rawConfig: RawK6PluginConfig,
	) {
		super(schema, fragments, rawConfig, {});

		autoBind(this);

		this._additionalImports.push(
			'import { type RefinedResponse, type ResponseType } from "k6/http";',
		);
		this._externalImportPrefix = this.config.importOperationTypesFrom
			? `${this.config.importOperationTypesFrom}.`
			: "";
	}

	protected buildOperation(
		node: OperationDefinitionNode,
		documentVariableName: string,
		operationType: string,
		operationResultType: string,
		operationVariablesTypes: string,
	): string {
		if (node.name == null) {
			throw new Error(
				`PlugJn '@labdigital/graphql-codegen-k6' cannot generate SDK for unnamed operation.\n\n${print(node)}`,
			);
		} else {
			this._operationsToInclude.push({
				node,
				documentVariableName,
				operationType,
				operationResultType: this._externalImportPrefix + operationResultType,
				operationVariablesTypes:
					this._externalImportPrefix + operationVariablesTypes,
			});
		}

		return "";
	}

	private getDocumentNodeVariable(documentVariableName: string): string {
		return this.config.documentMode === DocumentMode.external
			? `Operations.${documentVariableName}`
			: documentVariableName;
	}

	public get sdkContent(): string {
		const allPossibleActions = this._operationsToInclude
			.map((o) => {
				const operationName = o.node.name?.value;
				if (!operationName) throw new Error("Operation name is missing");
				const optionalVariables =
					!o.node.variableDefinitions ||
					o.node.variableDefinitions.length === 0 ||
					o.node.variableDefinitions.every(
						(v) => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue,
					);
				const docVarName = this.getDocumentNodeVariable(o.documentVariableName);
				const resultData = "RefinedResponse<ResponseType>";
				return `${operationName}(variables${optionalVariables ? "?" : ""}: ${
					o.operationVariablesTypes
				}, options?: C): ${resultData} {
          return requester<${o.operationResultType}, ${
						o.operationVariablesTypes
					}>(${docVarName}, variables, options);
        }`;
			})
			.map((s) => indentMultiline(s, 2));

		const documentNodeType =
			this.config.documentMode === DocumentMode.string
				? "string"
				: "DocumentNode";

		return `
    export type Requester<C = {}, E = unknown> = <R, V>(doc: ${documentNodeType}, vars?: V, options?: C) => RefinedResponse<ResponseType>

    export function getSdk<C, E>(requester: Requester<C, E>) {
      return {
        ${allPossibleActions.join(",\n")}
      };
    }
    export type Sdk = ReturnType<typeof getSdk>;`;
	}
}
