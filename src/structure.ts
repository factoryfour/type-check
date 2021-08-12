import { asArray, asObject } from './basic';
import { castErr, castErrChain, CastResult } from './castResult';
import { isErr, ok } from './result';

export function structure<T extends { [key: string]: unknown }>(
	asChildTypes: {
		[K in keyof Required<T>]: (value: unknown) => CastResult<T[K]>;
	},
): (value: unknown) => CastResult<T> {
	return (value): CastResult<T> => {
		const valueObjectResult = asObject(value);
		if (isErr(valueObjectResult)) {
			return valueObjectResult;
		}
		const objValue = valueObjectResult.value;
		for (const key of Object.keys(asChildTypes)) {
			const child = asChildTypes[key](objValue[key]);
			if (isErr(child)) {
				return castErrChain(child, key);
			}
		}
		return ok(objValue as T);
	};
}

export function tuple<T extends unknown[]>(
	...asChildTypes: {
		[K in keyof Required<T>]: (value: unknown) => CastResult<T[K]>;
	}
): (value: unknown) => CastResult<T> {
	return (value): CastResult<T> => {
		const valueArrayResult = asArray(value);
		if (isErr(valueArrayResult)) {
			return valueArrayResult;
		}
		const arrValue = valueArrayResult.value;
		if (arrValue.length !== asChildTypes.length) {
			return castErr(`tuple of length ${asChildTypes.length}`, arrValue);
		}
		for (let idx = 0; idx < asChildTypes.length; idx += 1) {
			const child = asChildTypes[idx](arrValue[idx]);
			if (isErr(child)) {
				return castErrChain(child, idx);
			}
		}
		return ok(arrValue as T);
	};
}
