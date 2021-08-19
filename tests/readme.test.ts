/// Ensure the readme example still compiles
import {
	arrayOf,
	asBoolean,
	asNull,
	asNumber,
	asObject,
	asString,
	asUndefined,
	asUnknown,
	castErr,
	castErrChain,
	Cast,
	literal,
	nullable,
	objectOf,
	oneOf,
	optional,
	structure,
	tuple,
	result,
	castOk,
	isFromAs,
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

const asApiResponse = structure<ApiResponse>({
	header: structure({
		success: asBoolean,
		tags: arrayOf(asString),
		code: tuple(asNumber, asString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left', 'right'),
			angle: oneOf(asNumber, literal('unknown')),
			arguments: objectOf(asString),
			comment: optional(asString),
			user: nullable(
				structure({
					name: asString,
				}),
			),
			extra: asUnknown,
		}),
	),
});

const isApiResponse = isFromAs(asApiResponse);

const stillAsApiResponse = structure<ApiResponse>({
	header: structure({
		success: literal(false),
		tags: tuple(asString, asString),
		code: tuple(literal(404), asString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left'),
			angle: asNumber,
			arguments: structure({
				someKey: asString,
			}),
			comment: asUndefined,
			user: asNull,
			extra: asUnknown,
		}),
	),
});

type InnerType = {
	a: string;
};

type OuterType = {
	b: InnerType;
};

const asInnerType = structure<InnerType>({
	a: asString,
});

// Also ensures nothing else is in there
const customAsInnerType: Cast<InnerType> = (data) => {
	const dataObjResult = asObject(data);
	if (result.isErr(dataObjResult)) {
		return dataObjResult;
	}
	if (Object.keys(dataObjResult.value).length !== 1) {
		return castErr('{ a: string } without extra keys', data);
	}
	const aFieldResult = asString(dataObjResult.value.a);
	if (result.isErr(aFieldResult)) {
		return castErrChain(aFieldResult, 'a');
	}
	return castOk(data as InnerType);
};

// Same as above, but a bit cleaner
const customAsInnerType2: Cast<InnerType> = (data) =>
	result
		.pipe(asInnerType(data))
		.then((output) => {
			if (Object.keys(output).length !== 1) {
				return castErr('{ a: string } without extra keys', data);
			}
			return castOk(output);
		})
		.finish();

const asOuterType0 = structure<OuterType>({
	b: structure({
		a: asString,
	}),
});

const asOuterType1 = structure<OuterType>({
	b: asInnerType,
});

const asOuterType2 = structure<OuterType>({
	b: customAsInnerType,
});

const asOuterType3 = structure<OuterType>({
	b: customAsInnerType2,
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

		expect(asApiResponse(goodValue)).toStrictEqual(result.ok(goodValue));
		expect(asApiResponse(unnecessarilyConstrainedValue)).toStrictEqual(
			result.ok(unnecessarilyConstrainedValue),
		);
		expect(asApiResponse(badValue).ok).toBe(false);

		expect(stillAsApiResponse(goodValue).ok).toBe(false);
		expect(stillAsApiResponse(unnecessarilyConstrainedValue)).toStrictEqual(
			result.ok(unnecessarilyConstrainedValue),
		);
		expect(stillAsApiResponse(badValue).ok).toBe(false);

		function iWantAnApiResponse(value: ApiResponse) {
			// eslint-disable-next-line no-unused-expressions
			value;
		}

		const goodValueResult = asApiResponse(goodValue);
		if (result.isOk(goodValueResult)) {
			// This will be called
			iWantAnApiResponse(goodValueResult.value);
		}
		const badValueResult = asApiResponse(badValue);
		if (result.isOk(badValueResult)) {
			// This will not be reached
			iWantAnApiResponse(badValueResult.value);
		}

		if (isApiResponse(goodValue)) {
			// This will be called
			iWantAnApiResponse(goodValue);
		}
		if (isApiResponse(badValue)) {
			// This will not be reached
			iWantAnApiResponse(badValue);
		}

		const valueWithBadHeader = {
			header: {
				success: true,
				tags: ['a', 'b', 3],
				code: [200, 'success'],
			},
			data: [],
		};
		expect(asApiResponse(valueWithBadHeader)).toStrictEqual({
			ok: false,
			errorMessage: "Value at 'header.tags.2' is not of type 'string'",
			path: ['header', 'tags', 2],
			expected: 'string',
			received: 3,
		});
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

		expect(asOuterType0(looselyGoodValue)).toStrictEqual(
			result.ok(looselyGoodValue),
		);
		expect(asOuterType0(strictlyGoodValue)).toStrictEqual(
			result.ok(strictlyGoodValue),
		);
		expect(asOuterType0(badValue).ok).toBe(false);

		expect(asOuterType1(looselyGoodValue)).toStrictEqual(
			result.ok(looselyGoodValue),
		);
		expect(asOuterType1(strictlyGoodValue)).toStrictEqual(
			result.ok(strictlyGoodValue),
		);
		expect(asOuterType1(badValue).ok).toBe(false);

		expect(asOuterType2(looselyGoodValue).ok).toBe(false);
		expect(asOuterType2(strictlyGoodValue)).toStrictEqual(
			result.ok(strictlyGoodValue),
		);
		expect(asOuterType2(badValue).ok).toBe(false);

		expect(asOuterType3(looselyGoodValue).ok).toBe(false);
		expect(asOuterType3(strictlyGoodValue)).toStrictEqual(
			result.ok(strictlyGoodValue),
		);
		expect(asOuterType3(badValue).ok).toBe(false);
	});
});
