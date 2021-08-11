import {
	isUnknown,
	isNull,
	isUndefined,
	isString,
	isNumber,
	isBoolean,
	isObject,
	isArray,
} from '../index';

describe('isUnknown', () => {
	it('always returns true', () => {
		expect(isUnknown(5)).toBe(true);
		expect(isUnknown(false)).toBe(true);
		expect(isUnknown(undefined)).toBe(true);
		expect(isUnknown(null)).toBe(true);
		expect(isUnknown('foo')).toBe(true);
		expect(isUnknown({ a: 5 })).toBe(true);
		expect(isUnknown([3, 4, 5])).toBe(true);
	});
});

describe('isNull', () => {
	it('returns true only if null', () => {
		expect(isNull(5)).toBe(false);
		expect(isNull(false)).toBe(false);
		expect(isNull(undefined)).toBe(false);
		expect(isNull(null)).toBe(true);
		expect(isNull('foo')).toBe(false);
		expect(isNull({ a: 5 })).toBe(false);
		expect(isNull([3, 4, 5])).toBe(false);
	});
});

describe('isUndefined', () => {
	it('returns true only if undefined', () => {
		expect(isUndefined(5)).toBe(false);
		expect(isUndefined(false)).toBe(false);
		expect(isUndefined(undefined)).toBe(true);
		expect(isUndefined(null)).toBe(false);
		expect(isUndefined('foo')).toBe(false);
		expect(isUndefined({ a: 5 })).toBe(false);
		expect(isUndefined([3, 4, 5])).toBe(false);
	});
});

describe('isString', () => {
	it('returns true only if it is a string', () => {
		expect(isString(5)).toBe(false);
		expect(isString(false)).toBe(false);
		expect(isString(undefined)).toBe(false);
		expect(isString(null)).toBe(false);
		expect(isString('foo')).toBe(true);
		expect(isString({ a: 5 })).toBe(false);
		expect(isString([3, 4, 5])).toBe(false);
	});
});

describe('isNumber', () => {
	it('returns true only if it is a number', () => {
		expect(isNumber(5)).toBe(true);
		expect(isNumber(false)).toBe(false);
		expect(isNumber(undefined)).toBe(false);
		expect(isNumber(null)).toBe(false);
		expect(isNumber('foo')).toBe(false);
		expect(isNumber({ a: 5 })).toBe(false);
		expect(isNumber([3, 4, 5])).toBe(false);
	});
});

describe('isBoolean', () => {
	it('returns true only if it is a boolean', () => {
		expect(isBoolean(5)).toBe(false);
		expect(isBoolean(false)).toBe(true);
		expect(isBoolean(undefined)).toBe(false);
		expect(isBoolean(null)).toBe(false);
		expect(isBoolean('foo')).toBe(false);
		expect(isBoolean({ a: 5 })).toBe(false);
		expect(isBoolean([3, 4, 5])).toBe(false);
	});
});

describe('isObject', () => {
	it('returns true only if it is an object', () => {
		expect(isObject(5)).toBe(false);
		expect(isObject(false)).toBe(false);
		expect(isObject(undefined)).toBe(false);
		expect(isObject(null)).toBe(false);
		expect(isObject('foo')).toBe(false);
		expect(isObject({ a: 5 })).toBe(true);
		expect(isObject([3, 4, 5])).toBe(false);
	});
});

describe('isArray', () => {
	it('returns true only if it is an array', () => {
		expect(isArray(5)).toBe(false);
		expect(isArray(false)).toBe(false);
		expect(isArray(undefined)).toBe(false);
		expect(isArray(null)).toBe(false);
		expect(isArray('foo')).toBe(false);
		expect(isArray({ a: 5 })).toBe(false);
		expect(isArray([3, 4, 5])).toBe(true);
	});
});
