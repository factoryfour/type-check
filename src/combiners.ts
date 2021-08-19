import { asArray, asNull, asObject, asUndefined } from './basic';
import { Cast, castErr, castErrChain, castOk, CastResult } from './castResult';
import { result } from './result';

export function oneOf<T extends unknown[]>(
	...asChildTypes: { [P in keyof T]: Cast<T[P]> }
): Cast<T[number]> {
	return (value) => {
		const failedTypes = [];
		for (const asChildType of asChildTypes) {
			const child = asChildType(value);
			if (result.isOk(child)) {
				return child;
			}
			if (child.path.length > 0) {
				failedTypes.push(
					`${child.expected} at ${child.path.join('.')}`,
				);
			} else {
				failedTypes.push(child.expected);
			}
		}
		return castErr(failedTypes.join(' | '), value);
	};
}

export function literal<T extends string | number | boolean>(
	...literals: readonly T[]
): Cast<T> {
	const literalsType = literals.map((v) => `${v}`).join(' | ');
	return (value) => {
		if (literals.some((v) => v === value)) {
			return castOk(value as T);
		}
		return castErr(literalsType, value);
	};
}

export function optional<T>(asChildType: Cast<T>): Cast<T | undefined> {
	return oneOf(asUndefined, asChildType);
}

export function nullable<T>(asChildType: Cast<T>): Cast<T | null> {
	return oneOf(asNull, asChildType);
}

function handleChild<T>(
	key: string | number,
	item: unknown,
	asChildType: Cast<T>,
): CastResult<T> {
	return result
		.pipe(asChildType(item))
		.orElse((err) => castErrChain(err, key))
		.finish();
}

export function arrayOf<T>(asChildType: Cast<T>): Cast<T[]> {
	return (value) =>
		result
			.pipe(asArray(value))
			.then((arrValue) =>
				result.all(arrValue, (item, idx) =>
					handleChild(idx, item, asChildType),
				),
			)
			.then(() => castOk(value as T[]))
			.finish();
}

export function objectOf<T>(asChildType: Cast<T>): Cast<{ [key: string]: T }> {
	return (value) =>
		result
			.pipe(asObject(value))
			.then((objValue) =>
				result.all(Object.keys(objValue), (key) =>
					handleChild(key, objValue[key], asChildType),
				),
			)
			.then(() => castOk(value as { [key: string]: T }))
			.finish();
}
