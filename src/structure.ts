import { isArray, isObject } from './basic';

export function structure<T extends { [key: string]: unknown }>(
	isChildTypes: {
		[K in keyof Required<T>]: (value: unknown) => value is T[K];
	},
): (value: unknown) => value is T {
	return (value): value is T =>
		isObject(value) &&
		Object.keys(isChildTypes).every((key) =>
			isChildTypes[key as keyof T]?.(value[key]),
		);
}

export function tuple<T extends unknown[]>(
	...isChildTypes: {
		[K in keyof Required<T>]: (value: unknown) => value is T[K];
	}
): (value: unknown) => value is T {
	return (value): value is T =>
		isArray(value) &&
		value.length === isChildTypes.length &&
		isChildTypes.every((checker, idx) => checker(value[idx]));
}
