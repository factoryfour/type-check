import { asArray, asObject } from './basic';
import { Cast, castErr, castErrChain, castOk } from './castResult';
import { result } from './result';

export function structure<T extends { [key: string]: unknown }>(
	asChildTypes: {
		[K in keyof Required<T>]: Cast<T[K]>;
	},
): Cast<T> {
	return (value) =>
		result
			.pipe(asObject(value))
			.then((objValue) =>
				result.all(Object.keys(asChildTypes), (key) =>
					result
						.pipe(asChildTypes[key](objValue[key]))
						.orElse((err) => castErrChain(err, key))
						.finish(),
				),
			)
			.then(() => castOk(value as T))
			.finish();
}

export function tuple<T extends unknown[]>(
	...asChildTypes: {
		[K in keyof Required<T>]: Cast<T[K]>;
	}
): Cast<T> {
	return (value) =>
		result
			.pipe(asArray(value))
			.then((arrValue) => {
				if (arrValue.length !== asChildTypes.length) {
					return castErr(
						`tuple of length ${asChildTypes.length}`,
						arrValue,
					);
				}
				return result.all(asChildTypes, (asChildType, idx) =>
					result
						.pipe(asChildType(arrValue[idx]))
						.orElse((err) => castErrChain(err, idx))
						.finish(),
				);
			})
			.then(() => castOk(value as T))
			.finish();
}
