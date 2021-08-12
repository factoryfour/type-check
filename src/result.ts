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

export function ok<T>(value: T): Ok<T> {
	return {
		ok: true,
		value,
	};
}

export function err<E>(errorMessage: string, body: E): Err<E> {
	return {
		...body,
		ok: false,
		errorMessage,
	};
}

export function errMsg(errorMessage: string): Err<BasicError> {
	return err(errorMessage, {});
}

export function isOk<T, E>(v: Result<T, E>): v is Ok<T> {
	return v.ok;
}

export function isErr<T, E>(v: Result<T, E>): v is Err<E> {
	return !v.ok;
}

export function unwrap<T, E>(v: Result<T, E>): T {
	if (isOk(v)) {
		return v.value;
	}
	throw new Error(`Unexpected error: ${v.errorMessage}`);
}

function pickFirst<T>(a: T): T {
	return a;
}

export function reduce<T, E, U = T>(
	data: Result<T, E>[],
	reduceOk: (accum: U, val: T) => U,
	reduceErr: (a: Err<E>, b: Err<E>) => Err<E> = pickFirst,
	initialValue: U,
): Result<U, E> {
	if (data.some(isErr)) {
		return data.filter(isErr).reduce(reduceErr);
	}
	return ok(
		data
			.filter(isOk)
			.map((v) => v.value)
			.reduce(reduceOk, initialValue),
	);
}

export function mapAndIgnoreErrors<InputType, OutputType, E>(
	array: InputType[],
	mapper: (input: InputType, index: number) => Result<OutputType, E>,
	onError?: (error: Err<E>) => void,
): OutputType[] {
	const output: OutputType[] = [];
	for (let index = 0; index < array.length; index += 1) {
		const element = array[index];
		const result = mapper(element, index);
		if (isOk(result)) {
			output.push(result.value);
		} else {
			onError?.(result);
		}
	}
	return output;
}

export function mapUnlessError<InputType, OutputType, E>(
	array: InputType[],
	mapper: (input: InputType, index: number) => Result<OutputType, E>,
): Result<OutputType[], E> {
	const output: OutputType[] = [];
	for (let index = 0; index < array.length; index += 1) {
		const element = array[index];
		const result = mapper(element, index);
		if (isOk(result)) {
			output.push(result.value);
		} else {
			return result;
		}
	}
	return ok(output);
}
