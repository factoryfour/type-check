import { asArray, asNull, asObject, asUndefined } from './basic';
import { castErr, castErrChain, CastResult } from './castResult';
import { isErr, isOk, ok } from './result';

export function oneOf<T extends unknown[]>(
	...asChildTypes: { [P in keyof T]: (value: unknown) => CastResult<T[P]> }
): (value: unknown) => CastResult<T[number]> {
	return (value): CastResult<T[number]> => {
		const failedTypes = [];
		for (const asChildType of asChildTypes) {
			const child = asChildType(value);
			if (isOk(child)) {
				return child;
			}
			failedTypes.push(child.expected);
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
			return ok(value as T);
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

export function arrayOf<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<T[]> {
	return (value): CastResult<T[]> => {
		const valueArrayResult = asArray(value);
		if (isErr(valueArrayResult)) {
			return valueArrayResult;
		}
		const arrValue = valueArrayResult.value;
		for (let idx = 0; idx < arrValue.length; idx += 1) {
			const child = asChildType(arrValue[idx]);
			if (isErr(child)) {
				return castErrChain(child, idx);
			}
		}
		return ok(value as T[]);
	};
}

export function objectOf<T>(
	asChildType: (value: unknown) => CastResult<T>,
): (value: unknown) => CastResult<{ [key: string]: T }> {
	return (value): CastResult<{ [key: string]: T }> => {
		const valueObjectResult = asObject(value);
		if (isErr(valueObjectResult)) {
			return valueObjectResult;
		}
		const objValue = valueObjectResult.value;
		for (const key of Object.keys(objValue)) {
			const child = asChildType(objValue[key]);
			if (isErr(child)) {
				return castErrChain(child, key);
			}
		}
		return ok(objValue as { [key: string]: T });
	};
}
