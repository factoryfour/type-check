import {
	arrayOf,
	isBoolean,
	isNumber,
	isString,
	nullable,
	oneOf,
	literal,
	optional,
	structure,
	isNull,
	isUndefined,
	tuple,
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
			type: literal('foo', 'bar'),
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
			type: literal('foo', 'bar'),
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
			type: literal('foo'),
		});

		const isTargetTypeB = structure<TargetType>({
			foo: isString,
			bar: isNull,
			baz: structure({
				a: isUndefined,
			}),
			type: literal('bar'),
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

// Specifying target type is optional for structure, but it massively
// helps by automatically pointing out mistakes in your matcher
type TargetTuple = [string, number | null | 'foo', number[] | undefined];

describe('tuple', () => {
	it('returns true if array of desired shape', () => {
		const isTargetTuple = tuple<TargetTuple>(
			isString,
			oneOf(isNumber, isNull, literal('foo')),
			optional(arrayOf(isNumber)),
		);

		expect(isTargetTuple(5)).toBe(false);
		expect(isTargetTuple(false)).toBe(false);
		expect(isTargetTuple(undefined)).toBe(false);
		expect(isTargetTuple(null)).toBe(false);
		expect(isTargetTuple('foo')).toBe(false);
		expect(isTargetTuple({ a: 5 })).toBe(false);
		expect(isTargetTuple([3, 4, 5])).toBe(false);

		expect(isTargetTuple(['a', 5, [1, 2, 3]])).toBe(true);
		expect(isTargetTuple(['a', null, undefined])).toBe(true);
		expect(isTargetTuple(['a', 'foo', undefined])).toBe(true);

		expect(isTargetTuple(['a', 'bar', undefined])).toBe(false);
		expect(isTargetTuple(['a', 'foo', ['a']])).toBe(false);
	});

	it('still compiles with tighter matching than needed', () => {
		const isTargetTupleFull = tuple<TargetTuple>(
			isString,
			oneOf(isNumber, isNull, literal('foo')),
			optional(arrayOf(isNumber)),
		);

		// Since `number` and `null` are subsets of `null | number`,
		// isNumber and isNull should both work as a replacement.
		// Same goes with any union type
		const isTargetTupleA = tuple<TargetTuple>(
			isString,
			isNumber,
			tuple(isNumber, isNumber),
		);

		const isTargetTupleB = tuple<TargetTuple>(
			isString,
			isNull,
			isUndefined,
		);

		const tupleFull = ['a', 'foo', [1, 2, 3]];
		const tupleA = ['a', 5, [1, 2]];
		const tupleB = ['a', null, undefined];

		expect(isTargetTupleFull(tupleFull)).toBe(true);
		expect(isTargetTupleFull(tupleA)).toBe(true);
		expect(isTargetTupleFull(tupleB)).toBe(true);

		expect(isTargetTupleA(tupleFull)).toBe(false);
		expect(isTargetTupleA(tupleA)).toBe(true);
		expect(isTargetTupleA(tupleB)).toBe(false);

		expect(isTargetTupleB(tupleFull)).toBe(false);
		expect(isTargetTupleB(tupleA)).toBe(false);
		expect(isTargetTupleB(tupleB)).toBe(true);
	});
});
