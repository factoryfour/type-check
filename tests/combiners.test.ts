import {
	arrayOf,
	isNumber,
	isString,
	nullable,
	objectOf,
	oneOf,
	literal,
	optional,
} from '../index';

describe('oneOf', () => {
	it('returns true if either of the input types', () => {
		const isStringOrNumber = oneOf(isString, isNumber);

		expect(isStringOrNumber(5)).toBe(true);
		expect(isStringOrNumber(false)).toBe(false);
		expect(isStringOrNumber(undefined)).toBe(false);
		expect(isStringOrNumber(null)).toBe(false);
		expect(isStringOrNumber('foo')).toBe(true);
		expect(isStringOrNumber({ a: 5 })).toBe(false);
		expect(isStringOrNumber([3, 4, 5])).toBe(false);
	});
});

describe('literal', () => {
	it('returns true if it matches one of the passed in literals', () => {
		const isFooBar = literal('foo', 'bar');

		expect(isFooBar(5)).toBe(false);
		expect(isFooBar(false)).toBe(false);
		expect(isFooBar(undefined)).toBe(false);
		expect(isFooBar(null)).toBe(false);
		expect(isFooBar('foo')).toBe(true);
		expect(isFooBar('bar')).toBe(true);
		expect(isFooBar('baz')).toBe(false);
		expect(isFooBar({ a: 5 })).toBe(false);
		expect(isFooBar([3, 4, 5])).toBe(false);
	});
});

describe('nullable', () => {
	it('returns true on null or right content', () => {
		const isNullableString = nullable(isString);

		expect(isNullableString(5)).toBe(false);
		expect(isNullableString(false)).toBe(false);
		expect(isNullableString(undefined)).toBe(false);
		expect(isNullableString(null)).toBe(true);
		expect(isNullableString('foo')).toBe(true);
		expect(isNullableString({ a: 5 })).toBe(false);
		expect(isNullableString([3, 4, 5])).toBe(false);
	});
});

describe('optional', () => {
	it('returns true on undefined or right content', () => {
		const isOptionalString = optional(isString);

		expect(isOptionalString(5)).toBe(false);
		expect(isOptionalString(false)).toBe(false);
		expect(isOptionalString(undefined)).toBe(true);
		expect(isOptionalString(null)).toBe(false);
		expect(isOptionalString('foo')).toBe(true);
		expect(isOptionalString({ a: 5 })).toBe(false);
		expect(isOptionalString([3, 4, 5])).toBe(false);
	});
});

describe('arrayOf', () => {
	it('returns true if array of desired type', () => {
		const isStringArray = arrayOf(isString);

		expect(isStringArray(5)).toBe(false);
		expect(isStringArray(false)).toBe(false);
		expect(isStringArray(undefined)).toBe(false);
		expect(isStringArray(null)).toBe(false);
		expect(isStringArray('foo')).toBe(false);
		expect(isStringArray({ a: 5 })).toBe(false);
		expect(isStringArray([3, 4, 5])).toBe(false);
		expect(isStringArray(['3', '4', '5'])).toBe(true);
	});

	it('ensures all elements are of correct type', () => {
		const isStringArray = arrayOf(isString);

		expect(isStringArray(['3', '4', '5'])).toBe(true);
		expect(isStringArray([3, '4', '5'])).toBe(false);
		expect(isStringArray(['3', 4, '5'])).toBe(false);
		expect(isStringArray(['3', '4', 5])).toBe(false);
		expect(isStringArray(['3', '4', undefined])).toBe(false);
	});
});

describe('objectOf', () => {
	it('returns true if object of desired type', () => {
		const isStringObject = objectOf(isString);

		expect(isStringObject(5)).toBe(false);
		expect(isStringObject(false)).toBe(false);
		expect(isStringObject(undefined)).toBe(false);
		expect(isStringObject(null)).toBe(false);
		expect(isStringObject('foo')).toBe(false);
		expect(isStringObject({ a: 5 })).toBe(false);
		expect(isStringObject({ a: '5' })).toBe(true);
		expect(isStringObject([3, 4, 5])).toBe(false);
	});

	it('ensures all elements are of correct type', () => {
		const isStringObject = objectOf(isString);

		expect(isStringObject({ a: '5', b: '6', c: '7' })).toBe(true);
		expect(isStringObject({ a: '5', b: '6', c: 7 })).toBe(false);
		expect(isStringObject({ a: '5', b: undefined, c: '7' })).toBe(false);
	});
});
