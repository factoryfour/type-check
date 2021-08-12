import { err, Err, Result } from './result';

export type CastError = {
	path: string;
	expected: string;
	received: unknown;
};

export type CastResult<T> = Result<T, CastError>;

export function castErr(
	errorMessage: string,
	path: string,
	expected: string,
	received: unknown,
): Err<CastError> {
	return err(errorMessage, {
		path,
		expected,
		received,
	});
}

export function castErrChain(e: Err<CastError>, field: string): Err<CastError> {
	return castErr(
		e.errorMessage,
		e.path === '' ? field : `${field}.${e.path}`,
		e.expected,
		e.received,
	);
}
