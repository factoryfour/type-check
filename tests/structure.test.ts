import {
	arrayOf,
	isBoolean,
	isNumber,
	isString,
	nullable,
	oneOf,
	oneOfLiterals,
	optional,
	structure,
	isNull,
	isUndefined,
} from '../src';

// Specifying target type is optional for structure, but it massively
// helps by automatically pointing out mistakes in your matcher
type TargetType = {
	foo: string;
	bar: number | null;
	baz: {
		a?: (number | boolean)[];
	};
	type: 'foo' | 'bar';
};

describe('structure', () => {
	it('returns true if object of desired shape', () => {
		const isTargetType = structure<TargetType>({
			foo: isString,
			bar: nullable(isNumber),
			baz: structure({
				a: optional(arrayOf(oneOf(isNumber, isBoolean))),
			}),
			type: oneOfLiterals(['foo', 'bar']),
		});

		expect(isTargetType(5)).toBe(false);
		expect(isTargetType(false)).toBe(false);
		expect(isTargetType(undefined)).toBe(false);
		expect(isTargetType(null)).toBe(false);
		expect(isTargetType('foo')).toBe(false);
		expect(isTargetType({ a: 5 })).toBe(false);
		expect(isTargetType([3, 4, 5])).toBe(false);

		expect(
			isTargetType({
				foo: 'a',
				bar: 5,
				baz: {
					a: [1, 2, false],
				},
				type: 'bar',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 'a',
				bar: null,
				baz: {
					a: [1, 2, false],
				},
				type: 'bar',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 'a',
				bar: 5,
				baz: {
					a: undefined,
				},
				type: 'bar',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 'a',
				bar: 5,
				baz: {
					a: [1, 2, false],
				},
				type: 'bar',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 'b',
				bar: null,
				baz: {
					a: undefined,
				},
				type: 'foo',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 'b',
				bar: null,
				baz: {},
				type: 'foo',
			}),
		).toBe(true);

		expect(
			isTargetType({
				foo: 5,
				bar: null,
				baz: {
					a: undefined,
				},
				type: 'baz',
			}),
		).toBe(false);
	});

	it('still compiles with tighter matching than needed', () => {
		const isTargetTypeFull = structure<TargetType>({
			foo: isString,
			bar: nullable(isNumber),
			baz: structure({
				a: optional(arrayOf(oneOf(isNumber, isBoolean))),
			}),
			type: oneOfLiterals(['foo', 'bar']),
		});

		// Since `number` and `null` are subsets of `null | number`,
		// isNumber and isNull should both work as a replacement.
		// Same goes with any union type
		const isTargetTypeA = structure<TargetType>({
			foo: isString,
			bar: isNumber,
			baz: structure({
				a: arrayOf(isNumber),
			}),
			type: oneOfLiterals(['foo']),
		});

		const isTargetTypeB = structure<TargetType>({
			foo: isString,
			bar: isNull,
			baz: structure({
				a: isUndefined,
			}),
			type: oneOfLiterals(['bar']),
		});

		const structFull = {
			foo: 'a',
			bar: 5,
			baz: {
				a: [1, 2, false],
			},
			type: 'bar',
		};

		const structA = {
			foo: 'a',
			bar: 5,
			baz: {
				a: [1, 2, 3],
			},
			type: 'foo',
		};

		const structB = {
			foo: 'a',
			bar: null,
			baz: {},
			type: 'bar',
		};

		expect(isTargetTypeFull(structFull)).toBe(true);
		expect(isTargetTypeFull(structA)).toBe(true);
		expect(isTargetTypeFull(structB)).toBe(true);

		expect(isTargetTypeA(structFull)).toBe(false);
		expect(isTargetTypeA(structA)).toBe(true);
		expect(isTargetTypeA(structB)).toBe(false);

		expect(isTargetTypeB(structFull)).toBe(false);
		expect(isTargetTypeB(structA)).toBe(false);
		expect(isTargetTypeB(structB)).toBe(true);
	});
});
