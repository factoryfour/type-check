/// Ensure the readme example still compiles
import {
	arrayOf,
	isBoolean,
	isNull,
	isNumber,
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
} from '../src';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stillIsApiResponse = structure<ApiResponse>({
	header: structure({
		success: isBoolean,
		tags: tuple(isString, isString),
		code: tuple(isNumber, isString),
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

describe('readme', () => {
	it('evaluates correctly for one example value', () => {
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

		function iWantAnApiResponse(value: ApiResponse) {
			// eslint-disable-next-line no-unused-expressions
			value;
		}

		expect(isApiResponse(goodValue)).toBe(true);
		if (isApiResponse(goodValue)) {
			// This will be called
			iWantAnApiResponse(goodValue);
		}

		expect(isApiResponse(badValue)).toBe(false);
		if (isApiResponse(badValue)) {
			// This will not be reached
			iWantAnApiResponse(badValue);
		}
	});
});
