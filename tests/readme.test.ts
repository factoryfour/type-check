/// Ensure the readme example still compiles
import {
	arrayOf,
	isBoolean,
	isNull,
	isNumber,
	isObject,
	isString,
	isUndefined,
	isUnknown,
	literal,
	nullable,
	objectOf,
	oneOf,
	optional,
	structure,
	tuple,
} from '../index';

type ApiResponse = {
	header: {
		success: boolean;
		tags: string[];
		code: [number, string];
	};
	data: {
		direction: 'left' | 'right';
		angle: number | 'unknown';
		arguments: { [key: string]: string };
		comment?: string;
		user: {
			name: string;
		} | null;
		extra?: unknown;
	}[];
};

const isApiResponse = structure<ApiResponse>({
	header: structure({
		success: isBoolean,
		tags: arrayOf(isString),
		code: tuple(isNumber, isString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left', 'right'),
			angle: oneOf(isNumber, literal('unknown')),
			arguments: objectOf(isString),
			comment: optional(isString),
			user: nullable(
				structure({
					name: isString,
				}),
			),
			extra: isUnknown,
		}),
	),
});

const stillIsApiResponse = structure<ApiResponse>({
	header: structure({
		success: literal(false),
		tags: tuple(isString, isString),
		code: tuple(literal(404), isString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left'),
			angle: isNumber,
			arguments: structure({
				someKey: isString,
			}),
			comment: isUndefined,
			user: isNull,
			extra: isUnknown,
		}),
	),
});

type InnerType = {
	a: string;
};

type OuterType = {
	b: InnerType;
};

const isInnerType = structure<InnerType>({
	a: isString,
});

// Also ensures nothing else is in there
const customIsInnerType = (data: unknown): data is InnerType => {
	if (!isObject(data)) {
		return false;
	}
	if (Object.keys(data).length !== 1) {
		return false;
	}
	return isString(data.a);
};

// Same as above, but a bit cleaner
const customIsInnerType2 = (data: unknown): data is InnerType => {
	return isInnerType(data) && Object.keys(data).length === 1;
};

const isOuterType0 = structure<OuterType>({
	b: structure({
		a: isString,
	}),
});

const isOuterType1 = structure<OuterType>({
	b: isInnerType,
});

const isOuterType2 = structure<OuterType>({
	b: customIsInnerType,
});

const isOuterType3 = structure<OuterType>({
	b: customIsInnerType2,
});

describe('readme', () => {
	it('evaluates api response correctly for one example value', () => {
		const goodValue = {
			header: {
				success: true,
				tags: ['foo', 'bar'],
				code: [200, 'success'],
			},
			data: [
				{
					direction: 'left',
					angle: 'unknown',
					arguments: {
						foo: 'FOO',
						bar: '123',
					},
					comment: 'I am just commenting here',
					user: {
						name: 'John Doe',
					},
					extra: [1, 2, true],
				},
				{
					direction: 'right',
					angle: 33,
					arguments: {},
					user: null,
				},
			],
		};
		const unnecessarilyConstrainedValue = {
			header: {
				success: false,
				tags: ['foo', 'bar'],
				code: [404, 'success'],
			},
			data: [
				{
					direction: 'left',
					angle: 300,
					arguments: {
						someKey: 'FOO',
						bar: '123',
					},
					user: null,
					extra: [1, 2, true],
				},
			],
		};
		const badValue = {
			header: {
				success: true,
				tags: ['foo', 'bar'],
				code: [200, 'success'],
			},
			data: [
				{
					direction: 'left',
					angle: 'unknown',
					arguments: {
						foo: 'FOO',
						bar: '123',
					},
					comment: 'I am just commenting here',
					user: {
						name: 'John Doe',
					},
					extra: [1, 2, true],
				},
				{
					direction: 'right',
					angle: 33,
					arguments: {},
					user: undefined,
				},
			],
		};

		expect(isApiResponse(goodValue)).toBe(true);
		expect(isApiResponse(unnecessarilyConstrainedValue)).toBe(true);
		expect(isApiResponse(badValue)).toBe(false);

		expect(stillIsApiResponse(goodValue)).toBe(false);
		expect(stillIsApiResponse(unnecessarilyConstrainedValue)).toBe(true);
		expect(stillIsApiResponse(badValue)).toBe(false);

		function iWantAnApiResponse(value: ApiResponse) {
			// eslint-disable-next-line no-unused-expressions
			value;
		}

		if (isApiResponse(goodValue)) {
			// This will be called
			iWantAnApiResponse(goodValue);
		}
		if (isApiResponse(badValue)) {
			// This will not be reached
			iWantAnApiResponse(badValue);
		}
	});

	it('evaluates compound checkers correctly for one example value', () => {
		const looselyGoodValue = {
			b: {
				a: 'foo',
				x: 'bar',
			},
		};
		const strictlyGoodValue = {
			b: {
				a: 'foo',
			},
		};
		const badValue = {
			c: {
				a: 'foo',
			},
		};

		expect(isOuterType0(looselyGoodValue)).toBe(true);
		expect(isOuterType0(strictlyGoodValue)).toBe(true);
		expect(isOuterType0(badValue)).toBe(false);

		expect(isOuterType1(looselyGoodValue)).toBe(true);
		expect(isOuterType1(strictlyGoodValue)).toBe(true);
		expect(isOuterType1(badValue)).toBe(false);

		expect(isOuterType2(looselyGoodValue)).toBe(false);
		expect(isOuterType2(strictlyGoodValue)).toBe(true);
		expect(isOuterType2(badValue)).toBe(false);

		expect(isOuterType3(looselyGoodValue)).toBe(false);
		expect(isOuterType3(strictlyGoodValue)).toBe(true);
		expect(isOuterType3(badValue)).toBe(false);
	});
});
