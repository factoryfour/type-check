export type Ok<T> = {
	ok: true;
	value: T;
};

export type Err<E> = E & {
	ok: false;
	errorMessage: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type BasicError = {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type Result<T, E = BasicError> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T> {
	return {
		ok: true,
		value,
	};
}

function err<E>(errorMessage: string, body: E): Err<E> {
	return {
		...body,
		ok: false,
		errorMessage,
	};
}

function errMsg(errorMessage: string): Err<BasicError> {
	return err(errorMessage, {});
}

function isOk<T, E>(v: Result<T, E>): v is Ok<T> {
	return v.ok;
}

function isErr<T, E>(v: Result<T, E>): v is Err<E> {
	return !v.ok;
}

function unwrap<T, E>(v: Result<T, E>): T {
	if (isOk(v)) {
		return v.value;
	}
	throw new Error(`Unexpected error: ${v.errorMessage}`);
}

function then<T, U, E>(
	v: Result<T, E>,
	fn: (current: T) => Result<U, E>,
): Result<U, E> {
	if (isOk(v)) {
		return fn(v.value);
	}
	return v;
}

function pickFirst<T>(a: T): T {
	return a;
}

function collect<T, E>(
	data: Result<T, E>[],
	reduceErr: (a: Err<E>, b: Err<E>) => Err<E> = pickFirst,
): Result<T[], E> {
	const oks: T[] = [];
	const errors: Err<E>[] = [];
	data.forEach((item) => {
		if (isOk(item)) {
			oks.push(item.value);
		} else {
			errors.push(item);
		}
	});
	if (errors.length > 0) {
		return errors.reduce(reduceErr);
	}
	return ok(oks);
}

export const result = { unwrap, then, collect, ok, err, errMsg, isOk, isErr };
