import {
	arrayOf,
	asBoolean,
	asNumber,
	asString,
	nullable,
	oneOf,
	literal,
	optional,
	structure,
	asNull,
	asUndefined,
	tuple,
	result,
} from '../index';

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
		const asTargetType = structure<TargetType>({
			foo: asString,
			bar: nullable(asNumber),
			baz: structure({
				a: optional(arrayOf(oneOf(asNumber, asBoolean))),
			}),
			type: literal('foo', 'bar'),
		});

		expect(asTargetType(5).ok).toBe(false);
		expect(asTargetType(false).ok).toBe(false);
		expect(asTargetType(undefined).ok).toBe(false);
		expect(asTargetType(null).ok).toBe(false);
		expect(asTargetType('foo').ok).toBe(false);
		expect(asTargetType({ a: 5 }).ok).toBe(false);
		expect(asTargetType([3, 4, 5]).ok).toBe(false);

		const goodStruct1 = {
			foo: 'a',
			bar: 5,
			baz: {
				a: [1, 2, false],
			},
			type: 'bar',
		};
		expect(asTargetType(goodStruct1)).toStrictEqual(result.ok(goodStruct1));

		const goodStruct2 = {
			foo: 'a',
			bar: null,
			baz: {
				a: [1, 2, false],
			},
			type: 'bar',
		};
		expect(asTargetType(goodStruct2)).toStrictEqual(result.ok(goodStruct2));

		const goodStruct3 = {
			foo: 'a',
			bar: 5,
			baz: {
				a: undefined,
			},
			type: 'bar',
		};
		expect(asTargetType(goodStruct3)).toStrictEqual(result.ok(goodStruct3));

		const goodStruct4 = {
			foo: 'a',
			bar: 5,
			baz: {
				a: [1, 2, false],
			},
			type: 'bar',
		};
		expect(asTargetType(goodStruct4)).toStrictEqual(result.ok(goodStruct4));

		const goodStruct5 = {
			foo: 'b',
			bar: null,
			baz: {
				a: undefined,
			},
			type: 'foo',
		};
		expect(asTargetType(goodStruct5)).toStrictEqual(result.ok(goodStruct5));

		const goodStruct6 = {
			foo: 'b',
			bar: null,
			baz: {},
			type: 'foo',
		};
		expect(asTargetType(goodStruct6)).toStrictEqual(result.ok(goodStruct6));

		const badStruct1 = {
			foo: 5,
			bar: null,
			baz: {
				a: undefined,
			},
			type: 'baz',
		};
		expect(asTargetType(badStruct1).ok).toBe(false);
	});

	it('still compiles with tighter matching than needed', () => {
		const asTargetTypeFull = structure<TargetType>({
			foo: asString,
			bar: nullable(asNumber),
			baz: structure({
				a: optional(arrayOf(oneOf(asNumber, asBoolean))),
			}),
			type: literal('foo', 'bar'),
		});

		// Since `number` and `null` are subsets of `null | number`,
		// asNumber and asNull should both work as a replacement.
		// Same goes with any union type
		const asTargetTypeA = structure<TargetType>({
			foo: asString,
			bar: asNumber,
			baz: structure({
				a: arrayOf(asNumber),
			}),
			type: literal('foo'),
		});

		const asTargetTypeB = structure<TargetType>({
			foo: asString,
			bar: asNull,
			baz: structure({
				a: asUndefined,
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

		expect(asTargetTypeFull(structFull)).toStrictEqual(
			result.ok(structFull),
		);
		expect(asTargetTypeFull(structA)).toStrictEqual(result.ok(structA));
		expect(asTargetTypeFull(structB)).toStrictEqual(result.ok(structB));

		expect(asTargetTypeA(structFull).ok).toBe(false);
		expect(asTargetTypeA(structA)).toStrictEqual(result.ok(structA));
		expect(asTargetTypeA(structB).ok).toBe(false);

		expect(asTargetTypeB(structFull).ok).toBe(false);
		expect(asTargetTypeB(structA).ok).toBe(false);
		expect(asTargetTypeB(structB)).toStrictEqual(result.ok(structB));
	});
});

// Specifying target type is optional for structure, but it massively
// helps by automatically pointing out mistakes in your matcher
type TargetTuple = [string, number | null | 'foo', number[] | undefined];

describe('tuple', () => {
	it('returns true if array of desired shape', () => {
		const asTargetTuple = tuple<TargetTuple>(
			asString,
			oneOf(asNumber, asNull, literal('foo')),
			optional(arrayOf(asNumber)),
		);

		expect(asTargetTuple(5).ok).toBe(false);
		expect(asTargetTuple(false).ok).toBe(false);
		expect(asTargetTuple(undefined).ok).toBe(false);
		expect(asTargetTuple(null).ok).toBe(false);
		expect(asTargetTuple('foo').ok).toBe(false);
		expect(asTargetTuple({ a: 5 }).ok).toBe(false);
		expect(asTargetTuple([3, 4, 5]).ok).toBe(false);

		expect(asTargetTuple(['a', 5, [1, 2, 3]])).toStrictEqual(
			result.ok(['a', 5, [1, 2, 3]]),
		);
		expect(asTargetTuple(['a', null, undefined])).toStrictEqual(
			result.ok(['a', null, undefined]),
		);
		expect(asTargetTuple(['a', 'foo', undefined])).toStrictEqual(
			result.ok(['a', 'foo', undefined]),
		);

		expect(asTargetTuple(['a', 'bar', undefined]).ok).toBe(false);
		expect(asTargetTuple(['a', 'foo', ['a']]).ok).toBe(false);
	});

	it('still compiles with tighter matching than needed', () => {
		const asTargetTupleFull = tuple<TargetTuple>(
			asString,
			oneOf(asNumber, asNull, literal('foo')),
			optional(arrayOf(asNumber)),
		);

		// Since `number` and `null` are subsets of `null | number`,
		// asNumber and asNull should both work as a replacement.
		// Same goes with any union type
		const asTargetTupleA = tuple<TargetTuple>(
			asString,
			asNumber,
			tuple(asNumber, asNumber),
		);

		const asTargetTupleB = tuple<TargetTuple>(
			asString,
			asNull,
			asUndefined,
		);

		const tupleFull = ['a', 'foo', [1, 2, 3]];
		const tupleA = ['a', 5, [1, 2]];
		const tupleB = ['a', null, undefined];

		expect(asTargetTupleFull(tupleFull)).toStrictEqual(
			result.ok(tupleFull),
		);
		expect(asTargetTupleFull(tupleA)).toStrictEqual(result.ok(tupleA));
		expect(asTargetTupleFull(tupleB)).toStrictEqual(result.ok(tupleB));

		expect(asTargetTupleA(tupleFull).ok).toBe(false);
		expect(asTargetTupleA(tupleA)).toStrictEqual(result.ok(tupleA));
		expect(asTargetTupleA(tupleB).ok).toBe(false);

		expect(asTargetTupleB(tupleFull).ok).toBe(false);
		expect(asTargetTupleB(tupleA).ok).toBe(false);
		expect(asTargetTupleB(tupleB)).toStrictEqual(result.ok(tupleB));
	});
});
