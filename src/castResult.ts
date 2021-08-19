import { result, Err, Result } from './result';

export type CastError = {
	path: (string | number)[];
	expected: string;
	received: unknown;
};

export type CastResult<T> = Result<T, CastError>;

export type Cast<T> = (value: unknown) => CastResult<T>;

export const castOk = result.ok;

export function castErr(expected: string, received: unknown): Err<CastError> {
	return result.err(`Value is not of type '${expected}'`, {
		path: [],
		expected,
		received,
	});
}

export function castErrChain(
	e: Err<CastError>,
	field: string | number,
): Err<CastError> {
	const path = [field].concat(e.path);
	return result.err(
		`Value at '${path.join('.')}' is not of type '${e.expected}'`,
		{
			path,
			expected: e.expected,
			received: e.received,
		},
	);
}
