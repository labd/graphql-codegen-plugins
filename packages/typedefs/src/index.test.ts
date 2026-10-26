import { buildSchema, printSchema } from "graphql";
import { describe, expect, it } from "vitest";
import { plugin } from "./index";

/** Returns the SDL inside the generated gql`...` template literal. */
const extractSDL = (output: string): string => {
	const match = output.match(/gql`\n([\s\S]*)\n`;$/);
	if (!match) {
		throw new Error(`Unexpected output:\n${output}`);
	}
	return match[1].replace(/\\`/g, "`");
};

const schemaSDL = /* GraphQL */ `
	type Query {
		"Uses \`backticks\`"
		product(id: ID!): Product
	}

	type Mutation {
		addToCart(productId: ID!, quantity: Int!): Cart!
	}

	type Product {
		id: ID!
		name: String!
	}

	type Cart {
		id: ID!
		totalItems: Int!
	}
`;

describe("typedefs plugin", () => {
	it("generates the typeDefs module", () => {
		const output = plugin(buildSchema(schemaSDL));
		expect(output).toMatchSnapshot();
		expect(extractSDL(output)).toMatch(/^\textend schema \{\n/);
	});

	it("generates valid SDL that builds the same schema", () => {
		const schema = buildSchema(schemaSDL);
		const sdl = extractSDL(plugin(schema));
		expect(printSchema(buildSchema(sdl))).toBe(printSchema(schema));
	});

	it("only extends the schema definition", () => {
		// A schema without root types has no schema definition; previously the
		// output started with `extend type A` or `extend directive @x`.
		for (const input of [
			"type A { a: Int }",
			"directive @x on FIELD_DEFINITION type A { a: Int @x }",
		]) {
			const schema = buildSchema(input);
			const sdl = extractSDL(plugin(schema));
			expect(sdl).not.toContain("extend");
			expect(printSchema(buildSchema(sdl))).toBe(printSchema(schema));
		}
	});

	it("handles a schema definition with a description and directives", () => {
		const schema = buildSchema(`
			"The schema"
			schema @meta { query: Root }
			directive @meta on SCHEMA
			type Root { a: Int }
		`);

		// Extensions cannot have a description
		const extended = extractSDL(plugin(schema));
		expect(extended).toMatch(
			/^\textend schema @meta \{\n\t\tquery: Root\n\t\}/,
		);
		expect(buildSchema(extended).getQueryType()?.name).toBe("Root");
	});
});
