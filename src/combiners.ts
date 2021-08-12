import { asArray, asNull, asObject, asUndefined } from './basic';
import { castErr, castErrChain, CastResult } from './castResult';
import { result } from './result';

export function oneOf<T extends unknown[]>(
	...asChildTypes: { [P in keyof T]: (value: unknown) => CastResult<T[P]> }
): (value: unknown) => CastResult<T[number]> {
	return (value): CastResult<T[number]> => {
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
): (value: unknown) => CastResult<T> {
	const literalsType = literals.map((v) => `${v}`).join(' | ');
	return (value): CastResult<T> => {
		if (literals.some((v) => v === value)) {
			return result.ok(value as T);
		}
		return castErr(literalsType, value);
	};
}

export function optional<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<T | undefined> {
	return oneOf(asUndefined, asChildType);
}

export function nullable<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<T | null> {
	return oneOf(asNull, asChildType);
}

function handleChild<T>(
	key: string | number,
	item: unknown,
	asChildType: (value: unknown) => CastResult<T>,
): CastResult<T> {
	return result
		.pipe(asChildType(item))
		.orElse((err) => castErrChain(err, key))
		.finish();
}

export function arrayOf<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<T[]> {
	return (value): CastResult<T[]> =>
		result
			.pipe(asArray(value))
			.then((arrValue) =>
				result.all(arrValue, (item, idx) =>
					handleChild(idx, item, asChildType),
				),
			)
			.then(() => result.ok(value as T[]))
			.finish();
}

export function objectOf<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<{ [key: string]: T }> {
	return (value): CastResult<{ [key: string]: T }> =>
		result
			.pipe(asObject(value))
			.then((objValue) =>
				result.all(Object.keys(objValue), (key) =>
					handleChild(key, objValue[key], asChildType),
				),
			)
			.then(() => result.ok(value as { [key: string]: T }))
			.finish();
}
