import { type FragmentDefinitionNode, Kind, parse } from "graphql";
import { describe, expect, it } from "vitest";
import { collectUsedFragments } from "./operations";

const document = parse(`
	query GetCustomer {
		customer {
			...A
			addresses {
				...B
			}
			... on Customer {
				...C
			}
		}
	}

	fragment A on Customer { id ...B }
	fragment B on Address { id ...D }
	fragment C on Customer { id ...A }
	fragment D on Address { city }
	fragment Unused on Customer { id }
	fragment Cyclic1 on Customer { ...Cyclic2 }
	fragment Cyclic2 on Customer { ...Cyclic1 }
`);

const fragments = new Map(
	document.definitions
		.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION)
		.map((d) => [d.name.value, d as FragmentDefinitionNode]),
);

describe("collectUsedFragments", () => {
	it("returns the transitively used fragments once, in order of use", () => {
		const operation = document.definitions[0];
		if (operation.kind !== Kind.OPERATION_DEFINITION) {
			throw new Error("Expected an operation");
		}
		expect(collectUsedFragments(operation, fragments)).toEqual([
			"A",
			"B",
			"D",
			"C",
		]);
	});

	it("handles cyclic fragments", () => {
		const fragment = fragments.get("Cyclic1");
		if (!fragment) {
			throw new Error("Expected a fragment");
		}
		expect(collectUsedFragments(fragment, fragments)).toEqual([
			"Cyclic2",
			"Cyclic1",
		]);
	});

	it("includes unknown fragments by name", () => {
		const operation = parse("{ ...External }").definitions[0];
		if (operation.kind !== Kind.OPERATION_DEFINITION) {
			throw new Error("Expected an operation");
		}
		expect(collectUsedFragments(operation, fragments)).toEqual(["External"]);
	});
});
