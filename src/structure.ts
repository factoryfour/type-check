import { isObject } from './basic';

// eslint-disable-next-line import/prefer-default-export
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
