import {
	arrayOf,
	asNumber,
	asString,
	nullable,
	objectOf,
	oneOf,
	literal,
	optional,
	result,
} from '../index';

describe('oneOf', () => {
	it('returns true if either of the input types', () => {
		const asStringOrNumber = oneOf(asString, asNumber);

		expect(asStringOrNumber(5)).toStrictEqual(result.ok(5));
		expect(asStringOrNumber(false).ok).toBe(false);
		expect(asStringOrNumber(undefined).ok).toBe(false);
		expect(asStringOrNumber(null).ok).toBe(false);
		expect(asStringOrNumber('foo')).toStrictEqual(result.ok('foo'));
		expect(asStringOrNumber({ a: 5 }).ok).toBe(false);
		expect(asStringOrNumber([3, 4, 5]).ok).toBe(false);
	});
});

describe('literal', () => {
	it('returns true if it matches one of the passed in literals', () => {
		const asFooBar = literal('foo', 'bar');

		expect(asFooBar(5).ok).toBe(false);
		expect(asFooBar(false).ok).toBe(false);
		expect(asFooBar(undefined).ok).toBe(false);
		expect(asFooBar(null).ok).toBe(false);
		expect(asFooBar('foo')).toStrictEqual(result.ok('foo'));
		expect(asFooBar('bar')).toStrictEqual(result.ok('bar'));
		expect(asFooBar('baz').ok).toBe(false);
		expect(asFooBar({ a: 5 }).ok).toBe(false);
		expect(asFooBar([3, 4, 5]).ok).toBe(false);
	});
});

describe('nullable', () => {
	it('returns true on null or right content', () => {
		const asNullableString = nullable(asString);

		expect(asNullableString(5).ok).toBe(false);
		expect(asNullableString(false).ok).toBe(false);
		expect(asNullableString(undefined).ok).toBe(false);
		expect(asNullableString(null)).toStrictEqual(result.ok(null));
		expect(asNullableString('foo')).toStrictEqual(result.ok('foo'));
		expect(asNullableString({ a: 5 }).ok).toBe(false);
		expect(asNullableString([3, 4, 5]).ok).toBe(false);
	});
});

describe('optional', () => {
	it('returns true on undefined or right content', () => {
		const asOptionalString = optional(asString);

		expect(asOptionalString(5).ok).toBe(false);
		expect(asOptionalString(false).ok).toBe(false);
		expect(asOptionalString(undefined)).toStrictEqual(result.ok(undefined));
		expect(asOptionalString(null).ok).toBe(false);
		expect(asOptionalString('foo')).toStrictEqual(result.ok('foo'));
		expect(asOptionalString({ a: 5 }).ok).toBe(false);
		expect(asOptionalString([3, 4, 5]).ok).toBe(false);
	});
});

describe('arrayOf', () => {
	it('returns true if array of desired type', () => {
		const asStringArray = arrayOf(asString);

		expect(asStringArray(5).ok).toBe(false);
		expect(asStringArray(false).ok).toBe(false);
		expect(asStringArray(undefined).ok).toBe(false);
		expect(asStringArray(null).ok).toBe(false);
		expect(asStringArray('foo').ok).toBe(false);
		expect(asStringArray({ a: 5 }).ok).toBe(false);
		expect(asStringArray([3, 4, 5]).ok).toBe(false);
		expect(asStringArray(['3', '4', '5'])).toStrictEqual(
			result.ok(['3', '4', '5']),
		);
	});

	it('ensures all elements are of correct type', () => {
		const asStringArray = arrayOf(asString);

		expect(asStringArray(['3', '4', '5'])).toStrictEqual(
			result.ok(['3', '4', '5']),
		);
		expect(asStringArray([3, '4', '5']).ok).toBe(false);
		expect(asStringArray(['3', 4, '5']).ok).toBe(false);
		expect(asStringArray(['3', '4', 5]).ok).toBe(false);
		expect(asStringArray(['3', '4', undefined]).ok).toBe(false);
	});
});

describe('objectOf', () => {
	it('returns true if object of desired type', () => {
		const asStringObject = objectOf(asString);

		expect(asStringObject(5).ok).toBe(false);
		expect(asStringObject(false).ok).toBe(false);
		expect(asStringObject(undefined).ok).toBe(false);
		expect(asStringObject(null).ok).toBe(false);
		expect(asStringObject('foo').ok).toBe(false);
		expect(asStringObject({ a: 5 }).ok).toBe(false);
		expect(asStringObject({ a: '5' })).toStrictEqual(result.ok({ a: '5' }));
		expect(asStringObject([3, 4, 5]).ok).toBe(false);
	});

	it('ensures all elements are of correct type', () => {
		const asStringObject = objectOf(asString);

		expect(asStringObject({ a: '5', b: '6', c: '7' })).toStrictEqual(
			result.ok({ a: '5', b: '6', c: '7' }),
		);
		expect(asStringObject({ a: '5', b: '6', c: 7 }).ok).toBe(false);
		expect(asStringObject({ a: '5', b: undefined, c: '7' }).ok).toBe(false);
	});
});
