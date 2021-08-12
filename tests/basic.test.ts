import {
	asUnknown,
	asNull,
	asUndefined,
	asString,
	asNumber,
	asBoolean,
	asObject,
	asArray,
	isUnknown,
	isNull,
	isUndefined,
	isString,
	isNumber,
	isBoolean,
	isObject,
	isArray,
	ok,
} from '../index';

describe('asUnknown', () => {
	it('always returns the put in value', () => {
		expect(asUnknown(5)).toStrictEqual(ok(5));
		expect(asUnknown(false)).toStrictEqual(ok(false));
		expect(asUnknown(undefined)).toStrictEqual(ok(undefined));
		expect(asUnknown(null)).toStrictEqual(ok(null));
		expect(asUnknown('foo')).toStrictEqual(ok('foo'));
		expect(asUnknown({ a: 5 })).toStrictEqual(ok({ a: 5 }));
		expect(asUnknown([3, 4, 5])).toStrictEqual(ok([3, 4, 5]));
	});
});

describe('asNull', () => {
	it('returns put in value only if null', () => {
		expect(asNull(5).ok).toBe(false);
		expect(asNull(false).ok).toBe(false);
		expect(asNull(undefined).ok).toBe(false);
		expect(asNull(null)).toStrictEqual(ok(null));
		expect(asNull('foo').ok).toBe(false);
		expect(asNull({ a: 5 }).ok).toBe(false);
		expect(asNull([3, 4, 5]).ok).toBe(false);
	});
});

describe('asUndefined', () => {
	it('returns put in value only if undefined', () => {
		expect(asUndefined(5).ok).toBe(false);
		expect(asUndefined(false).ok).toBe(false);
		expect(asUndefined(undefined)).toStrictEqual(ok(undefined));
		expect(asUndefined(null).ok).toBe(false);
		expect(asUndefined('foo').ok).toBe(false);
		expect(asUndefined({ a: 5 }).ok).toBe(false);
		expect(asUndefined([3, 4, 5]).ok).toBe(false);
	});
});

describe('asString', () => {
	it('returns put in value only if it is a string', () => {
		expect(asString(5).ok).toBe(false);
		expect(asString(false).ok).toBe(false);
		expect(asString(undefined).ok).toBe(false);
		expect(asString(null).ok).toBe(false);
		expect(asString('foo')).toStrictEqual(ok('foo'));
		expect(asString({ a: 5 }).ok).toBe(false);
		expect(asString([3, 4, 5]).ok).toBe(false);
	});
});

describe('asNumber', () => {
	it('returns put in value only if it is a number', () => {
		expect(asNumber(5)).toStrictEqual(ok(5));
		expect(asNumber(false).ok).toBe(false);
		expect(asNumber(undefined).ok).toBe(false);
		expect(asNumber(null).ok).toBe(false);
		expect(asNumber('foo').ok).toBe(false);
		expect(asNumber({ a: 5 }).ok).toBe(false);
		expect(asNumber([3, 4, 5]).ok).toBe(false);
	});
});

describe('asBoolean', () => {
	it('returns put in value only if it is a boolean', () => {
		expect(asBoolean(5).ok).toBe(false);
		expect(asBoolean(false)).toStrictEqual(ok(false));
		expect(asBoolean(undefined).ok).toBe(false);
		expect(asBoolean(null).ok).toBe(false);
		expect(asBoolean('foo').ok).toBe(false);
		expect(asBoolean({ a: 5 }).ok).toBe(false);
		expect(asBoolean([3, 4, 5]).ok).toBe(false);
	});
});

describe('asObject', () => {
	it('returns put in value only if it is an object', () => {
		expect(asObject(5).ok).toBe(false);
		expect(asObject(false).ok).toBe(false);
		expect(asObject(undefined).ok).toBe(false);
		expect(asObject(null).ok).toBe(false);
		expect(asObject('foo').ok).toBe(false);
		expect(asObject({ a: 5 })).toStrictEqual(ok({ a: 5 }));
		expect(asObject([3, 4, 5]).ok).toBe(false);
	});
});

describe('asArray', () => {
	it('returns put in value only if it is an array', () => {
		expect(asArray(5).ok).toBe(false);
		expect(asArray(false).ok).toBe(false);
		expect(asArray(undefined).ok).toBe(false);
		expect(asArray(null).ok).toBe(false);
		expect(asArray('foo').ok).toBe(false);
		expect(asArray({ a: 5 }).ok).toBe(false);
		expect(asArray([3, 4, 5])).toStrictEqual(ok([3, 4, 5]));
	});
});

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
