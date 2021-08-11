import { isArray, isNull, isObject, isUndefined } from './basic';

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
