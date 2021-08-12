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

function orElse<T, E, F>(
	v: Result<T, E>,
	fn: (current: Err<E>) => Result<T, F>,
): Result<T, F> {
	if (isOk(v)) {
		return v;
	}
	return fn(v);
}

function pickFirst<T>(a: T): T {
	return a;
}

function all<T, U, E>(
	data: T[],
	fn: (item: T, idx: number) => Result<U, E>,
): Result<U[], E> {
	const outputs: U[] = [];
	for (let idx = 0; idx < data.length; idx += 1) {
		const item = fn(data[idx], idx);
		if (isOk(item)) {
			outputs.push(item.value);
		} else {
			return item;
		}
	}
	return ok(outputs);
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

type ResultPipe<T, E> = {
	finish: () => Result<T, E>;
	unwrap: () => T;
	then: <U>(fn: (current: T) => Result<U, E>) => ResultPipe<U, E>;
	orElse: <F>(fn: (current: Err<E>) => Result<T, F>) => ResultPipe<T, F>;
};

function pipe<T, E>(data: Result<T, E>): ResultPipe<T, E> {
	return {
		finish: (): Result<T, E> => data,
		unwrap: (): T => unwrap(data),
		then: <U>(fn: (current: T) => Result<U, E>): ResultPipe<U, E> =>
			pipe(then(data, fn)),
		orElse: <F>(fn: (current: Err<E>) => Result<T, F>): ResultPipe<T, F> =>
			pipe(orElse(data, fn)),
	};
}

export const result = {
	pipe,
	unwrap,
	then,
	orElse,
	all,
	collect,
	ok,
	err,
	errMsg,
	isOk,
	isErr,
};
