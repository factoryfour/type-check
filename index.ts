export const isUnknown = (value: unknown): value is unknown => true;

export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined =>
	value === undefined;

export const isString = (value: unknown): value is string =>
	typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
	typeof value === 'number';

export const isBoolean = (value: unknown): value is boolean =>
	typeof value === 'boolean';

export const isObject = (value: unknown): value is { [key: string]: unknown } =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = (value: unknown): value is unknown[] =>
	Array.isArray(value);

export function oneOf<T extends unknown[]>(
	...isChildTypes: { [P in keyof T]: (value: unknown) => value is T[P] }
): (value: unknown) => value is T[number] {
	return (value): value is T[number] =>
		isChildTypes.some((check) => check(value));
}

export function literal<T extends string | number | boolean>(
	...literals: readonly T[]
): (value: unknown) => value is T {
	return (value): value is T => literals.some((v) => v === value);
}

export function optional<T>(
	isChildType: (value: unknown) => value is T,
): (value: unknown) => value is T | undefined {
	return oneOf(isUndefined, isChildType);
}

export function nullable<T>(
	isChildType: (value: unknown) => value is T,
): (value: unknown) => value is T | null {
	return oneOf(isNull, isChildType);
}

export function arrayOf<T>(
	isChildType: (value: unknown) => value is T,
): (value: unknown) => value is T[] {
	return (value): value is T[] => isArray(value) && value.every(isChildType);
}

export function objectOf<T>(
	isChildType: (value: unknown) => value is T,
): (value: unknown) => value is { [key: string]: T } {
	return (value): value is { [key: string]: T } =>
		isObject(value) && Object.values(value).every(isChildType);
}

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

export default {
	isUnknown,
	isNull,
	isUndefined,
	isString,
	isNumber,
	isBoolean,
	isObject,
	isArray,
	oneOf,
	literal,
	optional,
	nullable,
	arrayOf,
	objectOf,
	structure,
	tuple,
};
