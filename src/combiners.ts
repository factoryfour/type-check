import { isArray, isNull, isObject, isUndefined } from './basic';

export function oneOf<T1, T2>(
	isChildType1: (value: unknown) => value is T1,
	isChildType2: (value: unknown) => value is T2,
): (value: unknown) => value is T1 | T2 {
	return (value): value is T1 | T2 =>
		isChildType1(value) || isChildType2(value);
}

export function oneOfLiterals<T extends string>(
	literals: readonly T[],
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
